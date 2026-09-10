using System;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text;

namespace BrickHigh.Infrastructure
{
    /// <summary>供 Application 轉譯的 SQLite 錯誤，不包含 SQL 或玩家資料。</summary>
    public sealed class SqliteFailure : Exception
    {
        /// <summary>原生 SQLite 結果碼。</summary>
        public int Code { get; }
        internal SqliteFailure(int code) : base("本機資料庫操作未完成。") { Code = code; }
    }

    /// <summary>SQLite C API 薄封裝；預設唯讀，每個工作使用自己的連線。</summary>
    public sealed class NativeSqlite : IDisposable
    {
        private IntPtr handle;
        private readonly object gate = new object();
        private const int Row = 100, Done = 101;

        /// <summary>開啟原生連線；只有製作／人工存檔測試可指定可寫。</summary>
        public NativeSqlite(string path, bool readOnly = true)
        {
            int code = Native.sqlite3_open_v2(Utf8(path), out handle, (readOnly ? 1 : 2 | 4) | 0x10000, IntPtr.Zero);
            if (code != 0) { Dispose(); throw new SqliteFailure(code); }
            try
            {
                Check(Native.sqlite3_busy_timeout(handle, 3000));
                Execute("PRAGMA foreign_keys=ON");
            }
            catch { Dispose(); throw; }
        }

        /// <summary>執行單一參數化命令。</summary>
        public void Execute(string sql, params object[] parameters) => Query(sql, parameters);

        /// <summary>讀取具名欄位；UTF-8 長度依原生 API 計算。</summary>
        public List<Dictionary<string, string>> Query(string sql, params object[] parameters)
        {
            lock (gate)
            {
                if (handle == IntPtr.Zero) throw new ObjectDisposedException(nameof(NativeSqlite));
                IntPtr statement = IntPtr.Zero;
                try
                {
                    Check(Native.sqlite3_prepare_v2(handle, Utf8(sql), -1, out statement, IntPtr.Zero));
                    if (statement == IntPtr.Zero) throw new SqliteFailure(21);
                    if (Native.sqlite3_bind_parameter_count(statement) != parameters.Length) throw new SqliteFailure(25);
                    for (int i = 0; i < parameters.Length; i++)
                    {
                        object value = parameters[i];
                        if (value == null) Check(Native.sqlite3_bind_null(statement, i + 1));
                        else if (value is int || value is long || value is bool)
                            Check(Native.sqlite3_bind_int64(statement, i + 1, Convert.ToInt64(value, CultureInfo.InvariantCulture)));
                        else
                        {
                            byte[] text = Utf8(Convert.ToString(value, CultureInfo.InvariantCulture));
                            Check(Native.sqlite3_bind_text(statement, i + 1, text, text.Length - 1, new IntPtr(-1)));
                        }
                    }
                    var rows = new List<Dictionary<string, string>>();
                    int result;
                    while ((result = Native.sqlite3_step(statement)) == Row)
                    {
                        var row = new Dictionary<string, string>(StringComparer.Ordinal);
                        for (int i = 0; i < Native.sqlite3_column_count(statement); i++)
                        {
                            string name = Marshal.PtrToStringUTF8(Native.sqlite3_column_name(statement, i));
                            IntPtr value = Native.sqlite3_column_text(statement, i);
                            row.Add(name, value == IntPtr.Zero ? null : Marshal.PtrToStringUTF8(value, Native.sqlite3_column_bytes(statement, i)));
                        }
                        rows.Add(row);
                    }
                    if (result != Done) throw new SqliteFailure(result);
                    return rows;
                }
                finally { if (statement != IntPtr.Zero) Native.sqlite3_finalize(statement); }
            }
        }

        private static byte[] Utf8(string value) => Encoding.UTF8.GetBytes(value + "\0");
        private static void Check(int code) { if (code != 0) throw new SqliteFailure(code); }
        /// <summary>釋放連線，重複呼叫安全。</summary>
        public void Dispose()
        {
            lock (gate)
            {
                if (handle != IntPtr.Zero) { Native.sqlite3_close_v2(handle); handle = IntPtr.Zero; }
            }
        }

        private static class Native
        {
            private const string Library = "sqlite3";
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_open_v2(byte[] name, out IntPtr db, int flags, IntPtr vfs);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_close_v2(IntPtr db);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_busy_timeout(IntPtr db, int milliseconds);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_prepare_v2(IntPtr db, byte[] sql, int length, out IntPtr statement, IntPtr tail);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_bind_parameter_count(IntPtr statement);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_bind_text(IntPtr statement, int index, byte[] value, int length, IntPtr destroy);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_bind_int64(IntPtr statement, int index, long value);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_bind_null(IntPtr statement, int index);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_step(IntPtr statement);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_column_count(IntPtr statement);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern IntPtr sqlite3_column_name(IntPtr statement, int index);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern IntPtr sqlite3_column_text(IntPtr statement, int index);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_column_bytes(IntPtr statement, int index);
            [DllImport(Library, CallingConvention = CallingConvention.Cdecl)] internal static extern int sqlite3_finalize(IntPtr statement);
        }
    }
}

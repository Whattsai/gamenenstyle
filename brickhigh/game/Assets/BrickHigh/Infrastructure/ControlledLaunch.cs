using System;
using System.IO;
using System.IO.Pipes;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BrickHigh.Infrastructure
{
    /// <summary>只供當次子程序使用的單次啟動權；不寫 token 到命令列或日誌。</summary>
    public sealed class LaunchAuthority : IDisposable
    {
        private readonly NamedPipeServerStream pipe;
        /// <summary>當次私有管線名稱。</summary>
        public string PipeName { get; } = "BrickHigh-Launch-" + Guid.NewGuid().ToString("N");
        /// <summary>隨機一次性通行資料，只透過子程序環境傳遞。</summary>
        public string Token { get; } = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        /// <summary>先建立管線再啟動子程序，避免啟動競態。</summary>
        public LaunchAuthority() => pipe = new NamedPipeServerStream(PipeName, PipeDirection.InOut, 1,
            PipeTransmissionMode.Byte, PipeOptions.Asynchronous);

        /// <summary>核對實際管線 client PID、安裝身分和版本；只允許指定子程序。</summary>
        public async Task<bool> AcceptAsync(int childPid, string installKey, string buildId, int timeoutMilliseconds)
        {
            using (var timeout = new CancellationTokenSource(timeoutMilliseconds))
            using (timeout.Token.Register(() => pipe.Dispose()))
            {
                try
                {
                    await pipe.WaitForConnectionAsync(timeout.Token).ConfigureAwait(false);
                    if (!GetNamedPipeClientProcessId(pipe.SafePipeHandle.DangerousGetHandle(), out uint actualPid)) return false;
                    var request = await LaunchWire.ReadAsync(pipe).ConfigureAwait(false);
                    bool accepted = actualPid == childPid && request == Token + "|" + installKey + "|" + buildId;
                    await LaunchWire.WriteAsync(pipe, accepted ? "OK" : "DENIED").ConfigureAwait(false);
                    return accepted;
                }
                catch (Exception error) when (error is IOException || error is OperationCanceledException || error is ObjectDisposedException)
                { return false; }
            }
        }
        /// <summary>關閉一次性管線，不終止 Player 或改動資料。</summary>
        public void Dispose() => pipe.Dispose();
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool GetNamedPipeClientProcessId(IntPtr pipe, out uint pid);
    }

    /// <summary>Player 啟動前核對啟動器的單次通行資料與指定安裝版本。</summary>
    public static class ControlledLaunch
    {
        /// <summary>缺少啟動器、混搭版本、逾時及重放一律拒絕；不配置遊戲資產。</summary>
        public static async Task<bool> AuthorizeAsync(string pipeName, string token, string installKey, string buildId,
            int timeoutMilliseconds = 5000, int expectedServerPid = 0)
        {
            if (string.IsNullOrEmpty(pipeName) || !pipeName.StartsWith("BrickHigh-Launch-", StringComparison.Ordinal)
                || pipeName.Length != 49 || pipeName.Substring(17).IndexOfAny(new[] { '/', '\\', ':', '|', '\n' }) >= 0
                || string.IsNullOrEmpty(token) || string.IsNullOrEmpty(installKey) || string.IsNullOrEmpty(buildId)
                || token.Length > 128 || installKey.Length > 256 || buildId.Length > 128
                || (token + installKey + buildId).IndexOfAny(new[] { '|', '\n', '\r' }) >= 0) return false;
            using (var pipe = new NamedPipeClientStream(".", pipeName, PipeDirection.InOut, PipeOptions.Asynchronous))
            using (var timeout = new CancellationTokenSource(timeoutMilliseconds))
            using (timeout.Token.Register(() => pipe.Dispose()))
            {
                try
                {
                    await pipe.ConnectAsync(timeoutMilliseconds, timeout.Token).ConfigureAwait(false);
                    if (expectedServerPid > 0 && (!GetNamedPipeServerProcessId(pipe.SafePipeHandle.DangerousGetHandle(), out uint pid)
                        || pid != expectedServerPid)) return false;
                    await LaunchWire.WriteAsync(pipe, token + "|" + installKey + "|" + buildId).ConfigureAwait(false);
                    return await LaunchWire.ReadAsync(pipe).ConfigureAwait(false) == "OK";
                }
                catch (Exception error) when (error is IOException || error is TimeoutException || error is OperationCanceledException || error is ObjectDisposedException)
                { return false; }
            }
        }
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool GetNamedPipeServerProcessId(IntPtr pipe, out uint pid);
    }

    internal static class LaunchWire
    {
        internal static async Task<string> ReadAsync(Stream stream)
        {
            var bytes = new byte[1];
            using (var data = new MemoryStream())
            {
                while (data.Length < 1024)
                {
                    if (await stream.ReadAsync(bytes, 0, 1).ConfigureAwait(false) == 0) throw new IOException("啟動管線提前關閉。");
                    if (bytes[0] == 10) return Encoding.UTF8.GetString(data.ToArray());
                    data.WriteByte(bytes[0]);
                }
                throw new IOException("啟動管線資料過長。");
            }
        }
        internal static async Task WriteAsync(Stream stream, string value)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(value + "\n");
            await stream.WriteAsync(bytes, 0, bytes.Length).ConfigureAwait(false);
            await stream.FlushAsync().ConfigureAwait(false);
        }
    }
}

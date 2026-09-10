using System;
using System.IO;
using NUnit.Framework;
using BrickHigh.Infrastructure;

namespace BrickHigh.Tests
{
    public class NativeSqliteTests
    {
        private string root;
        private string path;
        [SetUp] public void SetUp()
        {
            root = Path.Combine(Path.GetTempPath(), "BrickHigh-tests-" + Guid.NewGuid().ToString("N"), "中文 空格");
            Directory.CreateDirectory(root);
            path = Path.Combine(root, "catalog.db");
        }

        [Test]
        public void NativeAdapter_BindsChineseQuotesAndWildcards_UsesRealSqlite()
        {
            using (var db = new NativeSqlite(path, false))
            {
                db.Execute("CREATE TABLE sample(id INTEGER PRIMARY KEY,name TEXT NOT NULL)");
                db.Execute("INSERT INTO sample VALUES(?,?)", 1, "中文'100%_積木");
                db.Execute("INSERT INTO sample VALUES(?,?)", 2, "中文任意積木");
                var rows = db.Query("SELECT name FROM sample WHERE name LIKE ? ESCAPE '\\'", "%100\\%\\_%");
                Assert.That(rows.Count, Is.EqualTo(1));
                Assert.That(rows[0]["name"], Is.EqualTo("中文'100%_積木"));
                Assert.That(db.Query("PRAGMA integrity_check")[0]["integrity_check"], Is.EqualTo("ok"));
            }
        }

        [Test, Property("TDD", "UT-046")]
        public void LocalStoragePolicy_ReadOnlyCatalog_AvoidsSidecars()
        {
            using (var db = new NativeSqlite(path, false)) db.Execute("CREATE TABLE sample(id INTEGER)");
            var before = File.ReadAllBytes(path);
            using (var db = new NativeSqlite(path))
            {
                Assert.Throws<SqliteFailure>(() => db.Execute("INSERT INTO sample VALUES(1)"));
                Assert.That(db.Query("SELECT * FROM sample"), Is.Empty);
            }
            Assert.That(File.ReadAllBytes(path), Is.EqualTo(before));
            Assert.That(File.Exists(path + "-wal"), Is.False);
            Assert.That(File.Exists(path + "-shm"), Is.False);
        }

        [Test]
        public void NativeAdapter_FailedTransaction_RollsBackAndEnforcesForeignKeys()
        {
            using (var db = new NativeSqlite(path, false))
            {
                db.Execute("CREATE TABLE parent(id TEXT PRIMARY KEY)");
                db.Execute("CREATE TABLE child(id TEXT PRIMARY KEY,parent TEXT REFERENCES parent)");
                db.Execute("BEGIN IMMEDIATE");
                db.Execute("INSERT INTO parent VALUES(?)", "original");
                Assert.Throws<SqliteFailure>(() => db.Execute("INSERT INTO child VALUES(?,?)", "child", "absent"));
                db.Execute("ROLLBACK");
                Assert.That(db.Query("SELECT * FROM parent"), Is.Empty);
            }
        }
    }
}

using System.IO;
using NUnit.Framework;
using BrickHigh.Infrastructure;

namespace BrickHigh.Tests
{
    public class ContentPathPolicyTests
    {
        [TestCase("NUL")]
        [TestCase("models/CON.glb")]
        [TestCase("AUX/file")]
        [TestCase("COM1.bundle")]
        [TestCase("a\0b")]
        [TestCase("models/../bundle")]
        [TestCase("C:/bundle")]
        [TestCase("//server/bundle")]
        [TestCase("bundle:secret")]
        [Property("TDD", "UT-070")]
        public void Resolve_UnsafeWindowsKey_RejectsBeforeOpening(string key)
        {
            Assert.Throws<InvalidDataException>(() => SafeContent.Resolve(Path.GetTempPath(), key));
        }
    }
}

using System;
using System.Diagnostics;
using System.Threading.Tasks;
using BrickHigh.Infrastructure;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class ControlledLaunchTests
    {
        [Test]
        public async Task ControlledLaunch_ChildWithMatchingBuild_AuthenticatesOnce()
        {
            using (var authority = new LaunchAuthority())
            {
                var server = authority.AcceptAsync(Process.GetCurrentProcess().Id, "install-a", "build-a", 3000);
                Assert.That(await ControlledLaunch.AuthorizeAsync(authority.PipeName, authority.Token, "install-a", "build-a", 3000), Is.True);
                Assert.That(await server, Is.True);
            }
        }

        [TestCase("wrong-token", "install-a", "build-a")]
        [TestCase(null, "install-b", "build-a")]
        [TestCase(null, "install-a", "build-b")]
        public async Task ControlledLaunch_MixedAuthority_Rejects(string token, string root, string build)
        {
            using (var authority = new LaunchAuthority())
            {
                var server = authority.AcceptAsync(Process.GetCurrentProcess().Id, "install-a", "build-a", 3000);
                Assert.That(await ControlledLaunch.AuthorizeAsync(authority.PipeName, token ?? authority.Token, root, build, 3000), Is.False);
                Assert.That(await server, Is.False);
            }
        }

        [Test]
        public async Task ControlledLaunch_UnrelatedProcessOrMissingLauncher_Rejects()
        {
            Assert.That(await ControlledLaunch.AuthorizeAsync(null, null, "install-a", "build-a", 50), Is.False);
            using (var authority = new LaunchAuthority())
            {
                var server = authority.AcceptAsync(-1, "install-a", "build-a", 3000);
                Assert.That(await ControlledLaunch.AuthorizeAsync(authority.PipeName, authority.Token, "install-a", "build-a", 3000), Is.False);
                Assert.That(await server, Is.False);
            }
        }
    }
}

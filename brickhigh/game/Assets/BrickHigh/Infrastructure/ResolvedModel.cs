using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("BrickHigh.UnityRuntime")]
[assembly: InternalsVisibleTo("BrickHigh.Tests.EditMode")]

namespace BrickHigh.Infrastructure
{
    internal sealed class RuntimeFile
    {
        internal readonly string Root, Key, Sha256, Kind;
        internal readonly long Length;
        internal RuntimeFile(string root, string key, string sha256, string kind, long length)
        { Root = root; Key = key; Sha256 = sha256; Kind = kind; Length = length; }
    }

    /// <summary>僅在核對固定 session 與完整來源引用後，交給原生資產 adapter。</summary>
    internal sealed class ResolvedModel
    {
        internal readonly string Root, AddressKey, RuntimeBuildId, BundleKey, BundleSha256;
        internal ResolvedModel(string root, string address, string build, string bundle, string digest)
        { Root = root; AddressKey = address; RuntimeBuildId = build; BundleKey = bundle; BundleSha256 = digest; }
    }
}

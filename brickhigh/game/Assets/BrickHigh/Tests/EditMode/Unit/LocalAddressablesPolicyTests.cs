using System.IO;
using BrickHigh.Infrastructure;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class LocalAddressablesPolicyTests
    {
        private static JObject Settings() => JObject.Parse(@"{
            'm_buildTarget':'StandaloneWindows64','m_DisableCatalogUpdateOnStart':true,
            'm_IsLocalCatalogInBundle':false,'m_ExtraInitializationData':[],
            'm_CertificateHandlerType':{'m_AssemblyName':'','m_ClassName':''},
            'm_CatalogLocations':[{
                'm_Keys':['AddressablesMainContentCatalog'],
                'm_InternalId':'{UnityEngine.AddressableAssets.Addressables.RuntimePath}/catalog.bin',
                'm_Provider':'UnityEngine.AddressableAssets.ResourceProviders.ContentCatalogProvider',
                'm_Dependencies':[], 'SerializedData':[],
                'm_ResourceType':{'m_AssemblyName':'Unity.Addressables, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null',
                'm_ClassName':'UnityEngine.AddressableAssets.ResourceLocators.ContentCatalogData'}}]}");

        [Test, Property("TDD", "UT-071")]
        public void Validate_FixedLocalBootstrap_AcceptsOnlyDeclaredCatalog()
        {
            Assert.DoesNotThrow(() => LocalAddressablesPolicy.Validate(Settings().ToString(), new[] { "aa/catalog.bin" }));
            Assert.Throws<InvalidDataException>(() => LocalAddressablesPolicy.Validate(Settings().ToString(), new[] { "aa/other.bin" }));
        }

        [TestCase("remote")]
        [TestCase("update")]
        [TestCase("initialization")]
        [TestCase("certificate")]
        [TestCase("provider")]
        [TestCase("dependency")]
        [TestCase("serialized")]
        [TestCase("escape")]
        [TestCase("bundle")]
        [TestCase("target")]
        [TestCase("missing")]
        [TestCase("wrong-type")]
        [Property("TDD", "UT-071")]
        public void Validate_UnsafeBootstrap_RejectsBeforeAddressablesInitialization(string fault)
        {
            var value = Settings();
            var location = value["m_CatalogLocations"][0];
            switch (fault)
            {
                case "remote": location["m_InternalId"] = "http://127.0.0.1/catalog.bin"; break;
                case "update": value["m_DisableCatalogUpdateOnStart"] = false; break;
                case "initialization": value["m_ExtraInitializationData"] = new JArray(new JObject { ["m_Id"] = "untrusted" }); break;
                case "certificate": value["m_CertificateHandlerType"]["m_ClassName"] = "Untrusted"; break;
                case "provider": location["m_Provider"] = "UntrustedProvider"; break;
                case "dependency": location["m_Dependencies"] = new JArray("remote-hash"); break;
                case "serialized": location["SerializedData"] = new JArray(1); break;
                case "escape": location["m_InternalId"] = "{UnityEngine.AddressableAssets.Addressables.RuntimePath}/../catalog.bin"; break;
                case "bundle": value["m_IsLocalCatalogInBundle"] = true; break;
                case "target": value["m_buildTarget"] = "Android"; break;
                case "missing": value.Remove("m_DisableCatalogUpdateOnStart"); break;
                case "wrong-type": value["m_DisableCatalogUpdateOnStart"] = "true"; break;
            }
            Assert.Throws<InvalidDataException>(() => LocalAddressablesPolicy.Validate(value.ToString(), new[] { "aa/catalog.bin" }));
        }
    }
}

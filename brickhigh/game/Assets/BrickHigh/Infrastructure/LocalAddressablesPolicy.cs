using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BrickHigh.Infrastructure
{
    /// <summary>初始化前驗證固定本機 Addressables 設定，不執行資料中指定的程式或 URL。</summary>
    public static class LocalAddressablesPolicy
    {
        private const string RuntimePrefix = "{UnityEngine.AddressableAssets.Addressables.RuntimePath}/";

        /// <summary>只接受宣告於索引的本機 catalog、停用更新且沒有額外初始化行為的 Win64 設定。</summary>
        public static void Validate(string json, IEnumerable<string> localCatalogKeys)
        {
            JObject settings;
            try { settings = JObject.Parse(json, new JsonLoadSettings { DuplicatePropertyNameHandling = DuplicatePropertyNameHandling.Error }); }
            catch (JsonException error) { throw new InvalidDataException("啟動設定格式無效。", error); }
            if ((string)settings["m_buildTarget"] != "StandaloneWindows64"
                || settings["m_DisableCatalogUpdateOnStart"]?.Type != JTokenType.Boolean
                || (bool)settings["m_DisableCatalogUpdateOnStart"] != true
                || settings["m_IsLocalCatalogInBundle"]?.Type != JTokenType.Boolean
                || (bool)settings["m_IsLocalCatalogInBundle"] != false
                || !EmptyArray(settings["m_ExtraInitializationData"])) Reject();
            var certificate = settings["m_CertificateHandlerType"] as JObject;
            if (certificate == null || (string)certificate["m_AssemblyName"] != "" || (string)certificate["m_ClassName"] != "") Reject();
            var allowed = new HashSet<string>(localCatalogKeys ?? Array.Empty<string>(), StringComparer.Ordinal);
            if (!(settings["m_CatalogLocations"] is JArray locations) || locations.Count != 1) Reject();
            foreach (var location in (JArray)settings["m_CatalogLocations"])
            {
                if (!(location is JObject) || location["m_InternalId"]?.Type != JTokenType.String
                    || (string)location["m_Provider"] != "UnityEngine.AddressableAssets.ResourceProviders.ContentCatalogProvider"
                    || !EmptyArray(location["m_Dependencies"]) || !EmptyArray(location["SerializedData"])) Reject();
                string id = (string)location["m_InternalId"];
                if (!id.StartsWith(RuntimePrefix, StringComparison.Ordinal)) Reject();
                string relative = id.Substring(RuntimePrefix.Length);
                if (relative.Contains(':') || relative.Contains('\\') || relative.Split('/').Any(p => p.Length == 0 || p == "." || p == "..")
                    || !allowed.Contains("aa/" + relative)) Reject();
                if (!(location["m_Keys"] is JArray keys) || keys.Count != 1 || (string)keys[0] != "AddressablesMainContentCatalog") Reject();
                var type = location["m_ResourceType"] as JObject;
                if (type == null || (string)type["m_AssemblyName"] != "Unity.Addressables, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                    || (string)type["m_ClassName"] != "UnityEngine.AddressableAssets.ResourceLocators.ContentCatalogData") Reject();
            }
        }

        private static bool EmptyArray(JToken value) => value is JArray array && array.Count == 0;
        private static void Reject() => throw new InvalidDataException("啟動設定不符合固定離線載入契約。");
    }
}

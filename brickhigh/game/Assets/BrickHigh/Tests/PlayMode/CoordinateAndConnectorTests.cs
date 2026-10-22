using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BrickHigh.Domain;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace BrickHigh.Tests
{
    /// <summary>在真正 PlayMode 中，以 glTFast 匯入的 Gate 2 GLB 與 Unity MeshCollider 驗證座標、非對稱與插接空腔。</summary>
    public sealed class CoordinateAndConnectorTests
    {
        private const long MaxGlbBytes = 20L * 1024 * 1024;
        private readonly List<GameObject> roots = new List<GameObject>();
        private string generatedRoot;

        [Serializable]
        private sealed class EvidenceDocument
        {
            public SourceEvidence source;
            public GeometryEvidence geometry;
            public BoundsEvidence boundsMeters;
        }

        [Serializable]
        private sealed class SourceEvidence
        {
            public string filename;
        }

        [Serializable]
        private sealed class GeometryEvidence
        {
            public string sha256;
            public BoundsEvidence boundsMeters;
        }

        [Serializable]
        private sealed class BoundsEvidence
        {
            public float[] min;
            public float[] max;
        }

        [Serializable]
        private sealed class CollisionFixtureDocument
        {
            public int schemaVersion;
            public string validationStatus;
            public string folder;
            public string sourcePart;
            public string sourceDependencyDigest;
            public string modelSha256;
            public string coordinateProfile;
            public string maleProfile;
            public string femaleProfile;
            public ProbeFixture probe;
            public SocketFixture[] sockets;
            public ProxyBoxFixture[] proxyBoxes;
            public PassageFixture[] passageChecks;
            public SolidFixture[] solidChecks;
            public SpecialConnectorFixture[] specialConnectors;
            public SourceConnectorCheckFixture[] sourceConnectorChecks;
            public string evidence;
        }

        [Serializable]
        private sealed class ProbeFixture
        {
            public float radiusMeters;
            public float startOffsetFromMinY;
            public float endOffsetFromMinY;
            public float[] controlXZ;
            public string referencePlane;
            public bool useControlReferenceY;
            public float controlReferenceY;
            public float sourceStudDiameterMeters;
        }

        [Serializable]
        private sealed class SocketFixture
        {
            public string id;
            public float[] position;
        }

        [Serializable]
        private sealed class ProxyBoxFixture
        {
            public string id;
            public float[] center;
            public float[] size;
        }

        [Serializable]
        private sealed class PassageFixture
        {
            public string id;
            public float[] start;
            public float[] end;
            public float radiusMeters;
        }

        [Serializable]
        private sealed class SolidFixture
        {
            public string id;
            public string[] connectorIds;
            public float[] start;
            public float[] end;
            public float radiusMeters;
        }

        [Serializable]
        private sealed class SpecialConnectorFixture
        {
            public string id;
            public string family;
            public string profile;
            public string compatibleProfile;
            public string side;
            public float[] position;
            public float[] normal;
            public float[] tangent;
            public string[] degreesOfFreedom;
            public string[] passageIds;
            public string[] solidCheckIds;
        }

        [Serializable]
        private sealed class SourceConnectorCheckFixture
        {
            public string connectorId;
            public string profile;
            public string compatibleProfile;
            public string[] passageIds;
            public string[] solidCheckIds;
        }

        [SetUp]
        public void SetUp()
        {
#if UNITY_EDITOR
            generatedRoot = "Assets/BrickHigh/Tests/PlayMode/GeneratedRealGltf-" + Guid.NewGuid().ToString("N");
            Directory.CreateDirectory(AssetPathToFullPath(generatedRoot));
#endif
        }

        [TearDown]
        public void TearDown()
        {
            foreach (var root in roots)
                if (root != null) UnityEngine.Object.DestroyImmediate(root);
            roots.Clear();
#if UNITY_EDITOR
            if (!string.IsNullOrWhiteSpace(generatedRoot)) AssetDatabase.DeleteAsset(generatedRoot);
#endif
        }

        [UnityTest, NUnit.Framework.Property("TDD", "IT-004")]
        public IEnumerator RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract()
        {
            yield return null;
            Assert.That(UnityEngine.Application.isPlaying, Is.True, "IT-004 必須在真正 PlayMode 執行。 ");

            var collisionFixtures = CollisionFixtureNames();
            Assert.That(collisionFixtures, Has.Length.EqualTo(20), "Gate 2 固定集合必須正好覆蓋20份 collision fixtures。 ");
            var gate2Models = collisionFixtures.Select(ReadCollisionFixture).Select(fixture => fixture.folder).ToArray();
            Assert.That(gate2Models.Distinct(StringComparer.Ordinal).Count(), Is.EqualTo(20),
                "Gate 2 collision fixtures 必須對應20個不同模型，不能以重複模型灌水。 ");
            foreach (var modelFolder in gate2Models)
                VerifyBoundsAndGlbBudget(modelFolder, "conversion.json", true);

            VerifyTextureBearingPositiveCase();
            VerifyAsymmetricSlope();
            foreach (var fixtureName in collisionFixtures)
                VerifyConnectorPairingAndCavity(fixtureName);

            yield return null;
        }

        private void VerifyBoundsAndGlbBudget(string modelFolder, string metadataFile, bool boundsUnderGeometry)
        {
            var root = ImportRealModel(modelFolder);
            var actual = RendererBounds(root).size;
            var expected = ReadRecordedDimensions(modelFolder, metadataFile, boundsUnderGeometry);
            var modelPath = ModelPath(modelFolder, "model.glb");
            var modelBytes = new FileInfo(modelPath).Length;
            Debug.Log($"IT004_BOUNDS model={modelFolder} expected=({expected.x:R},{expected.y:R},{expected.z:R}) actual=({actual.x:R},{actual.y:R},{actual.z:R}) glbBytes={modelBytes} meshes={root.GetComponentsInChildren<MeshFilter>(true).Length}");

            Assert.That(MetadataValidationPolicy.DimensionMatches(expected.x, actual.x), Is.True,
                $"X 尺寸超出 SPEC 容差：expected={expected.x:R}, actual={actual.x:R}");
            Assert.That(MetadataValidationPolicy.DimensionMatches(expected.y, actual.y), Is.True,
                $"Y 尺寸超出 SPEC 容差：expected={expected.y:R}, actual={actual.y:R}");
            Assert.That(MetadataValidationPolicy.DimensionMatches(expected.z, actual.z), Is.True,
                $"Z 尺寸超出 SPEC 容差：expected={expected.z:R}, actual={actual.z:R}");
            Assert.That(root.GetComponentsInChildren<MeshFilter>(true).Length, Is.GreaterThan(0), "真實 GLB 必須產生 mesh。 ");
            Assert.That(modelBytes, Is.LessThanOrEqualTo(MaxGlbBytes), "真實 GLB 超過 20 MiB 資產預算。 ");
            VerifyRuntimeTextureBudget(root, modelFolder);
            Assert.That(InspectRuntimeMaterialBindings(root, false), Is.Null,
                "Gate 2 真實匯入模型不應含遺失材質或失效 Shader。 ");
        }

        private static string InspectRuntimeMaterialBindings(GameObject root, bool requireTexture)
        {
            if (root == null)
                return "MissingRoot";
            var renderers = root.GetComponentsInChildren<MeshRenderer>(true);
            if (renderers.Length == 0)
                return "MissingRenderer";
            var foundTexture = false;
            foreach (var renderer in renderers)
            {
                var materials = renderer.sharedMaterials;
                if (materials == null || materials.Length == 0)
                    return "MissingMaterial";
                foreach (var material in materials)
                {
                    if (material == null)
                        return "MissingMaterial";
                    if (material.shader == null || !material.shader.isSupported
                        || material.shader.name == "Hidden/InternalErrorShader")
                        return "UnsupportedShader";
                    var textures = material.GetTexturePropertyNames()
                        .Select(propertyName => material.GetTexture(propertyName))
                        .Where(texture => texture != null)
                        .ToArray();
                    if (textures.Length == 0)
                        continue;
                    foundTexture = true;
                    var mesh = renderer.GetComponent<MeshFilter>()?.sharedMesh;
                    if (mesh == null || mesh.uv == null || mesh.uv.Length != mesh.vertexCount)
                        return "MissingTextureUv";
                }
            }
            return requireTexture && !foundTexture ? "MissingTexture" : null;
        }

        private static Texture[] VerifyRuntimeTextureBudget(GameObject root, string modelFolder)
        {
            var textures = root.GetComponentsInChildren<Renderer>(true)
                .SelectMany(renderer => renderer.sharedMaterials ?? Array.Empty<Material>())
                .Where(material => material != null)
                .SelectMany(material => material.GetTexturePropertyNames()
                    .Select(propertyName => material.GetTexture(propertyName)))
                .Where(texture => texture != null)
                .Distinct()
                .ToArray();

            Debug.Log($"IT004_TEXTURE_BUDGET model={modelFolder} textures={textures.Length}");
            foreach (var texture in textures)
            {
                Debug.Log($"IT004_TEXTURE model={modelFolder} name={texture.name} width={texture.width} height={texture.height}");
                Assert.That(texture.width, Is.LessThanOrEqualTo(2048),
                    $"{modelFolder} runtime texture {texture.name} 寬度超過 2048。 ");
                Assert.That(texture.height, Is.LessThanOrEqualTo(2048),
                    $"{modelFolder} runtime texture {texture.name} 高度超過 2048。 ");
            }
            return textures;
        }

        private void VerifyTextureBearingPositiveCase()
        {
#if UNITY_EDITOR
            var root = ImportGeneratedTextureFixture();
            var textures = VerifyRuntimeTextureBudget(root, "generated-texture-positive");
            Assert.That(textures, Is.Not.Empty,
                "SC-029 texture-bearing 正例必須由 glTFast 真實匯入至少一張 runtime texture。 ");
            Assert.That(textures.Any(texture => texture.width == 32 && texture.height == 16), Is.True,
                "SC-029 texture-bearing 正例必須保留本測試產生的 32×16 texture 尺寸。 ");
            Debug.Log($"IT004_TEXTURE_POSITIVE textures={textures.Length} target32x16={textures.Count(texture => texture.width == 32 && texture.height == 16)}");
            Assert.That(InspectRuntimeMaterialBindings(root, true), Is.Null,
                "真實 glTFast 紋理正例不得有遺失材質、失效 Shader 或 UV 缺口。 ");
            var renderer = root.GetComponentsInChildren<MeshRenderer>(true).First();
            var original = renderer.sharedMaterials;
            try
            {
                renderer.sharedMaterials = new Material[] { null };
                Assert.That(InspectRuntimeMaterialBindings(root, true), Is.EqualTo("MissingMaterial"),
                    "缺材質的 Runtime Mesh 應被明確拒絕。 ");
                renderer.sharedMaterials = original;
                var withTexture = original.First(material => material != null
                    && material.GetTexturePropertyNames().Any(name => material.GetTexture(name) != null));
                var stripped = new Material(withTexture);
                try
                {
                    foreach (var propertyName in stripped.GetTexturePropertyNames())
                        stripped.SetTexture(propertyName, null);
                    renderer.sharedMaterials = original.Select(material => material == withTexture ? stripped : material).ToArray();
                    Assert.That(InspectRuntimeMaterialBindings(root, true), Is.EqualTo("MissingTexture"),
                        "Shader 有效但貼圖遺失，不得作為紋理材質驗證正例。 ");
                }
                finally
                {
                    renderer.sharedMaterials = original;
                    UnityEngine.Object.DestroyImmediate(stripped);
                }
                var errorShader = Shader.Find("Hidden/InternalErrorShader");
                Assert.That(errorShader, Is.Not.Null,
                    "測試環境需提供 Unity 真實的粉紅錯誤 Shader，不能用純字串假冒故障注入。 ");
                var invalid = new Material(errorShader);
                try
                {
                    renderer.sharedMaterials = new[] { invalid };
                    Assert.That(InspectRuntimeMaterialBindings(root, true), Is.EqualTo("UnsupportedShader"),
                        "Unity 粉紅錯誤 Shader 必須被辨識為材質缺陷。 ");
                }
                finally
                {
                    renderer.sharedMaterials = original;
                    UnityEngine.Object.DestroyImmediate(invalid);
                }
            }
            finally
            {
                renderer.sharedMaterials = original;
            }

#else
            Assert.Fail("SC-029 texture-bearing 正例目前固定由 Unity Editor PlayMode runner 驗證 glTFast 匯入結果。 ");
#endif
        }

        private GameObject ImportGeneratedTextureFixture()
        {
#if UNITY_EDITOR
            const string fixtureName = "it004-texture-positive";
            var pngAssetPath = generatedRoot + "/" + fixtureName + ".png";
            var gltfAssetPath = generatedRoot + "/" + fixtureName + ".gltf";

            var sourceTexture = new Texture2D(32, 16, TextureFormat.RGBA32, false);
            var pixels = new Color32[32 * 16];
            for (var y = 0; y < 16; y++)
            for (var x = 0; x < 32; x++)
                pixels[y * 32 + x] = ((x / 4 + y / 4) & 1) == 0
                    ? new Color32(255, 64, 64, 255)
                    : new Color32(64, 128, 255, 255);
            sourceTexture.SetPixels32(pixels);
            sourceTexture.Apply(false, false);
            File.WriteAllBytes(AssetPathToFullPath(pngAssetPath), sourceTexture.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(sourceTexture);

            var geometry = new[]
            {
                -0.5f, -0.5f, 0f,
                 0.5f, -0.5f, 0f,
                 0f,   0.5f, 0f,
                 0f,   0f,
                 1f,   0f,
                 0.5f, 1f
            };
            var geometryBytes = new byte[geometry.Length * sizeof(float)];
            System.Buffer.BlockCopy(geometry, 0, geometryBytes, 0, geometryBytes.Length);
            var encodedGeometry = Convert.ToBase64String(geometryBytes);
            var gltf = "{\n"
                + "  \"asset\": {\"version\": \"2.0\"},\n"
                + "  \"buffers\": [{\"uri\": \"data:application/octet-stream;base64," + encodedGeometry + "\", \"byteLength\": 60}],\n"
                + "  \"bufferViews\": [{\"buffer\":0,\"byteOffset\":0,\"byteLength\":36},{\"buffer\":0,\"byteOffset\":36,\"byteLength\":24}],\n"
                + "  \"accessors\": [{\"bufferView\":0,\"componentType\":5126,\"count\":3,\"type\":\"VEC3\",\"min\":[-0.5,-0.5,0],\"max\":[0.5,0.5,0]},{\"bufferView\":1,\"componentType\":5126,\"count\":3,\"type\":\"VEC2\"}],\n"
                + "  \"images\": [{\"uri\": \"" + fixtureName + ".png\"}],\n"
                + "  \"samplers\": [{\"magFilter\":9729,\"minFilter\":9729,\"wrapS\":33071,\"wrapT\":33071}],\n"
                + "  \"textures\": [{\"sampler\":0,\"source\":0}],\n"
                + "  \"materials\": [{\"doubleSided\":true,\"pbrMetallicRoughness\":{\"baseColorTexture\":{\"index\":0},\"metallicFactor\":0,\"roughnessFactor\":1}}],\n"
                + "  \"meshes\": [{\"primitives\":[{\"attributes\":{\"POSITION\":0,\"TEXCOORD_0\":1},\"material\":0}]}],\n"
                + "  \"nodes\": [{\"mesh\":0}],\n"
                + "  \"scenes\": [{\"nodes\":[0]}],\n"
                + "  \"scene\": 0\n"
                + "}\n";
            File.WriteAllText(AssetPathToFullPath(gltfAssetPath), gltf);

            AssetDatabase.ImportAsset(pngAssetPath, ImportAssetOptions.ForceSynchronousImport);
            AssetDatabase.ImportAsset(gltfAssetPath, ImportAssetOptions.ForceSynchronousImport);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(gltfAssetPath);
            Assert.That(prefab, Is.Not.Null, "glTFast Editor importer 未產生 texture-bearing GameObject。 ");

            var wrapper = new GameObject("IT-004 texture-bearing glTF");
            roots.Add(wrapper);
            var instance = UnityEngine.Object.Instantiate(prefab, wrapper.transform);
            instance.name = "Imported texture-bearing glTF";
            return wrapper;
#else
            Assert.Fail("SC-029 texture-bearing 正例目前固定由 Unity Editor PlayMode runner 驗證 glTFast 匯入結果。 ");
            return null;
#endif
        }

        private void VerifyAsymmetricSlope()
        {
            var root = ImportRealModel("pm-20260923-asymmetric-slope-3298-materials-v2");
            var points = WorldVertices(root).ToArray();
            Assert.That(points.Length, Is.GreaterThan(0));

            var bounds = RendererBounds(root);
            var center = bounds.center;
            var xMirrorCoverage = MirrorCoverage(points, center, true);
            var zMirrorCoverage = MirrorCoverage(points, center, false);
            var winding = WindingAgreement(root);
            Debug.Log($"IT004_ASYMMETRY xMirror={xMirrorCoverage:R} zMirror={zMirrorCoverage:R} triangles={winding.checkedTriangles} windingConsistency={winding.agreement:R}");

            Assert.That(Math.Min(xMirrorCoverage, zMirrorCoverage), Is.LessThan(0.985),
                "3298 真實模型至少一個水平軸必須保留非對稱幾何，避免匯入後被誤鏡像成對稱件。 ");
            Assert.That(winding.checkedTriangles, Is.GreaterThan(100), "需要足夠真實三角形才能驗證 winding。 ");
            Assert.That(winding.agreement, Is.GreaterThan(0.90),
                $"真實非對稱 GLB 的幾何 winding 與 vertex normals 缺乏一致方向：{winding.agreement:P2}");
        }

        private void VerifyConnectorPairingAndCavity(string fixtureName)
        {
            var fixture = ReadCollisionFixture(fixtureName);
            Assert.That(fixture.schemaVersion, Is.EqualTo(1));
            Assert.That(fixture.validationStatus, Is.EqualTo("Pending").Or.EqualTo("Verified"));
            Assert.That(fixture.coordinateProfile, Is.EqualTo("canonical-rh-metres-v1"));
            Assert.That(fixture.sockets, Is.Not.Null);
            Assert.That(fixture.proxyBoxes, Is.Not.Null.And.Not.Empty);
            Assert.That(fixture.sockets.Length > 0 || (fixture.specialConnectors?.Length ?? 0) > 0 || (fixture.sourceConnectorChecks?.Length ?? 0) > 0,
                Is.True, "fixture 必須至少提供一種可驗證 connector 證據。 ");

            var conversion = ReadEvidenceDocument(fixture.folder, "conversion.json");
            Assert.That(conversion.source?.filename, Is.EqualTo(fixture.sourcePart));
            Assert.That(conversion.geometry?.sha256, Is.EqualTo(fixture.modelSha256));

            var upper = ImportRealModel(fixture.folder);
            var upperBounds = RendererBounds(upper);
            var canonicalMinY = upperBounds.min.y;
            if (fixture.sockets.Length > 0)
            {
                Assert.That(fixture.probe, Is.Not.Null, "logical socket fixture 必須提供 stud 尺寸 probe。 ");
                if (fixture.maleProfile == "system-stud-v1")
                {
                    var lower = ImportRealModel("pm-20260927-expansion-v1/3005-colour14");
                    var lowerPoints = WorldVertices(lower).ToArray();
                    var studPoints = lowerPoints.Where(point => point.y > 0.0001f).ToArray();
                    Assert.That(studPoints.Length, Is.GreaterThan(20), "3005 真實 GLB 必須能辨識出高於磚面之 stud 幾何。 ");
                    var studMinX = studPoints.Min(point => point.x);
                    var studMaxX = studPoints.Max(point => point.x);
                    var studMinZ = studPoints.Min(point => point.z);
                    var studMaxZ = studPoints.Max(point => point.z);
                    var studRadius = Math.Min(studMaxX - studMinX, studMaxZ - studMinZ) / 2f;
                    Debug.Log($"IT004_STUD points={studPoints.Length} x=({studMinX:R},{studMaxX:R}) z=({studMinZ:R},{studMaxZ:R}) radius={studRadius:R}");
                    Assert.That(studRadius, Is.InRange(0.0022f, 0.0026f), "實際 3005 stud 半徑應落在可辨識的 LDraw 幾何範圍。 ");
                    Assert.That(Math.Abs(studRadius - fixture.probe.radiusMeters), Is.LessThanOrEqualTo(0.00015f),
                        "System socket fixture 的 probe 半徑必須與真實 system stud 幾何一致。 ");
                }
                else if (fixture.maleProfile == "duplo-stud-v1")
                {
                    Assert.That(fixture.probe.sourceStudDiameterMeters, Is.EqualTo(0.0096f).Within(0.000001f),
                        "DUPLO probe 必須綁定已由 LDraw stud7.dat 證明的 9.6 mm 來源直徑。 ");
                    Assert.That(Math.Abs(fixture.probe.sourceStudDiameterMeters / 2f - fixture.probe.radiusMeters),
                        Is.LessThanOrEqualTo(0.00015f),
                        "DUPLO socket fixture 的 probe 半徑必須貼近來源 stud 半徑。 ");
                }
                else
                {
                    Assert.Fail("尚未定義 logical socket probe 的 male profile：" + fixture.maleProfile);
                }
            }

            upper.transform.position += Vector3.up * -canonicalMinY;
            AddMeshColliders(upper);
            Physics.SyncTransforms();
            Debug.Log($"IT004_COLLIDERS fixture={fixture.folder} count={upper.GetComponentsInChildren<MeshCollider>(true).Length} upperBounds={RendererBounds(upper)}");

            var profiles = new Dictionary<string, ConnectorProfileDefinition>
            {
                ["technic-pin-v1"] = new ConnectorProfileDefinition(
                    "technic-pin-v1", new[] { "technic-hole-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["technic-hole-v1"] = new ConnectorProfileDefinition(
                    "technic-hole-v1", new[] { "technic-pin-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["technic-axle-v1"] = new ConnectorProfileDefinition(
                    "technic-axle-v1", new[] { "technic-axle-hole-v1" }, new[] { "axial-insert" }),
                ["technic-axle-hole-v1"] = new ConnectorProfileDefinition(
                    "technic-axle-hole-v1", new[] { "technic-axle-v1" }, new[] { "axial-insert" }),
                ["technic-friction-pin-v1"] = new ConnectorProfileDefinition(
                    "technic-friction-pin-v1", new[] { "technic-pin-hole-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["technic-pin-hole-v1"] = new ConnectorProfileDefinition(
                    "technic-pin-hole-v1", new[] { "technic-friction-pin-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["bar-v1"] = new ConnectorProfileDefinition(
                    "bar-v1", new[] { "clip-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["clip-v1"] = new ConnectorProfileDefinition(
                    "clip-v1", new[] { "bar-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["ball-v1"] = new ConnectorProfileDefinition(
                    "ball-v1", new[] { "socket-v1" }, new[] { "spherical-rotate" }),
                ["socket-v1"] = new ConnectorProfileDefinition(
                    "socket-v1", new[] { "ball-v1" }, new[] { "spherical-rotate" }),
                ["minifig-arm-pin-v1"] = new ConnectorProfileDefinition(
                    "minifig-arm-pin-v1", new[] { "minifig-torso-arm-socket-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["minifig-torso-arm-socket-v1"] = new ConnectorProfileDefinition(
                    "minifig-torso-arm-socket-v1", new[] { "minifig-arm-pin-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["minifig-neck-post-v1"] = new ConnectorProfileDefinition(
                    "minifig-neck-post-v1", new[] { "minifig-head-socket-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["minifig-head-socket-v1"] = new ConnectorProfileDefinition(
                    "minifig-head-socket-v1", new[] { "minifig-neck-post-v1" }, new[] { "axial-insert", "axial-rotate" }),
                ["minifig-hips-post-v1"] = new ConnectorProfileDefinition(
                    "minifig-hips-post-v1", new[] { "minifig-torso-hips-socket-v1" }, new[] { "axial-insert" }),
                ["minifig-torso-hips-socket-v1"] = new ConnectorProfileDefinition(
                    "minifig-torso-hips-socket-v1", new[] { "minifig-hips-post-v1" }, new[] { "axial-insert" })
            };
            var fixtureFreedom = fixture.maleProfile == "ball-v1" && fixture.femaleProfile == "socket-v1"
                ? new[] { "spherical-rotate" }
                : new[] { "axial-insert" };
            profiles[fixture.maleProfile] = new ConnectorProfileDefinition(
                fixture.maleProfile, new[] { fixture.femaleProfile }, fixtureFreedom);
            profiles[fixture.femaleProfile] = new ConnectorProfileDefinition(
                fixture.femaleProfile, new[] { fixture.maleProfile }, fixtureFreedom);
            Assert.That(ConnectorCompatibilityPolicy.CanPair(fixture.maleProfile, fixture.femaleProfile, profiles), Is.True);
            Assert.That(ConnectorCompatibilityPolicy.CanPair(fixture.maleProfile, "technic-hole-v1", profiles), Is.False,
                "不同 connector family 不得因幾何接近而誤配。 ");

            var proxyBoxes = fixture.proxyBoxes.Select(box => new CollisionBox(ToVector3d(box.center), ToVector3d(box.size))).ToArray();
            if (fixture.sockets.Length > 0)
            {
                var probeStartY = fixture.probe.startOffsetFromMinY;
                var probeEndY = fixture.probe.endOffsetFromMinY;
                foreach (var socket in fixture.sockets)
                {
                Assert.That(socket.position, Has.Length.EqualTo(3));
                var useSocketPlane = string.Equals(fixture.probe.referencePlane, "socket-y", StringComparison.Ordinal);
                var socketPlaneY = useSocketPlane ? socket.position[1] : canonicalMinY;
                if (useSocketPlane)
                {
                    Assert.That(socketPlaneY, Is.InRange(upperBounds.min.y - 0.0001f, upperBounds.max.y + 0.0001f),
                        $"logical socket {socket.id} 的接合平面必須在 {fixture.sourcePart} 實際 Y 範圍的 SPEC 容差內。 ");
                }
                else
                {
                    Assert.That(socket.position[1], Is.EqualTo(canonicalMinY).Within(0.0001f),
                        $"logical socket 必須固定在 {fixture.sourcePart} 底部基準面。 ");
                }
                var actualStart = CanonicalToShiftedUnity(socket.position[0], socketPlaneY + probeStartY, socket.position[2], canonicalMinY);
                var actualEnd = CanonicalToShiftedUnity(socket.position[0], socketPlaneY + probeEndY, socket.position[2], canonicalMinY);
                var actualHit = HitsFixture(upper, actualStart, actualEnd, fixture.probe.radiusMeters);

                var canonicalStart = new Vector3d(socket.position[0], socketPlaneY + probeStartY, socket.position[2]);
                var canonicalEnd = new Vector3d(socket.position[0], socketPlaneY + probeEndY, socket.position[2]);
                var proxyOpen = CollisionProxyPolicy.InsertionPathRemainsOpen(
                    proxyBoxes, new InsertionProbe(canonicalStart, canonicalEnd, fixture.probe.radiusMeters));
                Debug.Log($"IT004_CAVITY fixture={fixture.folder} socket={socket.id} x={socket.position[0]:R} z={socket.position[2]:R} actualHit={actualHit} proxyOpen={proxyOpen}");
                Assert.That(actualHit, Is.False,
                    $"{fixture.sourcePart} 的實際 MeshCollider 在 logical socket {socket.id} 封死插接空腔。 ");
                    Assert.That(proxyOpen, Is.True,
                        $"{fixture.sourcePart} compound collision proxy 在 logical socket {socket.id} 封死插接空腔。 ");
                }
            }

            if (fixture.passageChecks != null)
            {
                foreach (var passage in fixture.passageChecks)
                {
                    Assert.That(passage.start, Has.Length.EqualTo(3));
                    Assert.That(passage.end, Has.Length.EqualTo(3));
                    Assert.That(passage.radiusMeters, Is.GreaterThan(0));
                    var actualPassageStart = CanonicalToShiftedUnity(passage.start, canonicalMinY);
                    var actualPassageEnd = CanonicalToShiftedUnity(passage.end, canonicalMinY);
                    var actualPassageHit = HitsFixture(upper, actualPassageStart, actualPassageEnd, passage.radiusMeters);
                    var proxyPassageOpen = CollisionProxyPolicy.InsertionPathRemainsOpen(proxyBoxes,
                        new InsertionProbe(ToVector3d(passage.start), ToVector3d(passage.end), passage.radiusMeters));
                    Debug.Log($"IT004_PASSAGE fixture={fixture.folder} passage={passage.id} actualHit={actualPassageHit} proxyOpen={proxyPassageOpen}");
                    Assert.That(actualPassageHit, Is.False,
                        $"{fixture.sourcePart} 的實際 MeshCollider 封住應保持可通行的 passage {passage.id}。 ");
                    Assert.That(proxyPassageOpen, Is.True,
                        $"{fixture.sourcePart} compound collision proxy 封住應保持可通行的 passage {passage.id}。 ");
                }
            }

            if (fixture.solidChecks != null)
            {
                foreach (var solid in fixture.solidChecks)
                {
                    Assert.That(solid.start, Has.Length.EqualTo(3));
                    Assert.That(solid.end, Has.Length.EqualTo(3));
                    Assert.That(solid.radiusMeters, Is.GreaterThan(0));
                    Assert.That(solid.connectorIds, Is.Not.Null.And.Not.Empty);
                    var actualSolidStart = CanonicalToShiftedUnity(solid.start, canonicalMinY);
                    var actualSolidEnd = CanonicalToShiftedUnity(solid.end, canonicalMinY);
                    var actualSolidHit = HitsFixture(upper, actualSolidStart, actualSolidEnd, solid.radiusMeters);
                    var proxySolidOpen = CollisionProxyPolicy.InsertionPathRemainsOpen(proxyBoxes,
                        new InsertionProbe(ToVector3d(solid.start), ToVector3d(solid.end), solid.radiusMeters));
                    Debug.Log($"IT004_SOLID fixture={fixture.folder} solid={solid.id} actualHit={actualSolidHit} proxyOpen={proxySolidOpen}");
                    Assert.That(actualSolidHit, Is.True,
                        $"{fixture.sourcePart} 的實際 MeshCollider 未覆蓋應為實體的 connector 區域 {solid.id}。 ");
                    Assert.That(proxySolidOpen, Is.False,
                        $"{fixture.sourcePart} compound collision proxy 未覆蓋應為實體的 connector 區域 {solid.id}。 ");
                }
            }

            var passageIds = new HashSet<string>((fixture.passageChecks ?? Array.Empty<PassageFixture>()).Select(passage => passage.id), StringComparer.Ordinal);
            var solidIds = new HashSet<string>((fixture.solidChecks ?? Array.Empty<SolidFixture>()).Select(solid => solid.id), StringComparer.Ordinal);
            if (fixture.specialConnectors != null)
            {
                var socketIds = new HashSet<string>(fixture.sockets.Select(socket => socket.id), StringComparer.Ordinal);
                foreach (var connector in fixture.specialConnectors)
                {
                    Assert.That(connector.id, Is.Not.Null.And.Not.Empty);
                    Assert.That(socketIds.Add(connector.id), Is.True, $"special connector ID 重複：{connector.id}");
                    Assert.That(connector.family, Is.Not.Null.And.Not.Empty);
                    Assert.That(connector.profile, Is.Not.Null.And.Not.Empty);
                    Assert.That(connector.compatibleProfile, Is.Not.Null.And.Not.Empty);
                    Assert.That(connector.side, Is.EqualTo("female").Or.EqualTo("male"));
                    Assert.That(connector.position, Has.Length.EqualTo(3));
                    Assert.That(connector.normal, Has.Length.EqualTo(3));
                    Assert.That(connector.tangent, Has.Length.EqualTo(3));
                    Assert.That(connector.degreesOfFreedom, Is.Not.Null.And.Not.Empty);
                    if (connector.side == "female")
                    {
                        Assert.That(connector.passageIds, Is.Not.Null.And.Not.Empty);
                        Assert.That(connector.passageIds.All(passageIds.Contains), Is.True,
                            $"female special connector {connector.id} 必須綁定本 fixture 已實測 passage。 ");
                        Assert.That(connector.solidCheckIds == null || connector.solidCheckIds.Length == 0, Is.True);
                    }
                    else
                    {
                        Assert.That(connector.solidCheckIds, Is.Not.Null.And.Not.Empty);
                        Assert.That(connector.solidCheckIds.All(solidIds.Contains), Is.True,
                            $"male special connector {connector.id} 必須綁定本 fixture 已實測 solid check。 ");
                        Assert.That(connector.passageIds == null || connector.passageIds.Length == 0, Is.True);
                    }
                    Assert.That(ConnectorCompatibilityPolicy.CanPair(connector.compatibleProfile, connector.profile, profiles), Is.True,
                        $"special connector {connector.id} 的 profile 配對未被版本化規則接受。 ");
                }
            }

            if (fixture.sourceConnectorChecks != null)
            {
                foreach (var connector in fixture.sourceConnectorChecks)
                {
                    Assert.That(connector.connectorId, Is.Not.Null.And.Not.Empty);
                    Assert.That(connector.profile, Is.Not.Null.And.Not.Empty);
                    Assert.That(connector.compatibleProfile, Is.Not.Null.And.Not.Empty);
                    var sourcePassages = connector.passageIds ?? Array.Empty<string>();
                    var sourceSolids = connector.solidCheckIds ?? Array.Empty<string>();
                    var hasPassageEvidence = sourcePassages.Length > 0 && sourceSolids.Length == 0
                        && sourcePassages.All(passageIds.Contains);
                    var hasSolidEvidence = sourceSolids.Length > 0 && sourcePassages.Length == 0
                        && sourceSolids.All(solidIds.Contains);
                    Assert.That(hasPassageEvidence || hasSolidEvidence, Is.True,
                        $"source connector {connector.connectorId} 必須且只能綁定本 fixture 已實測 passage 或 solid check。 ");
                    Assert.That(ConnectorCompatibilityPolicy.CanPair(connector.compatibleProfile, connector.profile, profiles), Is.True,
                        $"source connector {connector.connectorId} 的 profile 配對未被版本化規則接受。 ");
                }
            }

            if (fixture.probe != null && fixture.probe.controlXZ != null)
            {
                Assert.That(fixture.probe.controlXZ, Has.Length.EqualTo(2));
                var probeStartY = fixture.probe.startOffsetFromMinY;
                var probeEndY = fixture.probe.endOffsetFromMinY;
                var controlPlaneY = fixture.probe.useControlReferenceY ? fixture.probe.controlReferenceY : canonicalMinY;
                var controlActual = HitsFixture(upper,
                    CanonicalToShiftedUnity(fixture.probe.controlXZ[0], controlPlaneY + probeStartY, fixture.probe.controlXZ[1], canonicalMinY),
                    CanonicalToShiftedUnity(fixture.probe.controlXZ[0], controlPlaneY + probeEndY, fixture.probe.controlXZ[1], canonicalMinY),
                    fixture.probe.radiusMeters);
                var controlProxyOpen = CollisionProxyPolicy.InsertionPathRemainsOpen(proxyBoxes,
                    new InsertionProbe(
                        new Vector3d(fixture.probe.controlXZ[0], controlPlaneY + probeStartY, fixture.probe.controlXZ[1]),
                        new Vector3d(fixture.probe.controlXZ[0], controlPlaneY + probeEndY, fixture.probe.controlXZ[1]),
                        fixture.probe.radiusMeters));
                Debug.Log($"IT004_CAVITY_CONTROL fixture={fixture.folder} actualHit={controlActual} proxyOpen={controlProxyOpen} radius={fixture.probe.radiusMeters:R}");
                Assert.That(controlActual, Is.True,
                    $"控制反例必須撞到 {fixture.sourcePart} 外側實體壁，否則真 MeshCollider cavity 測試沒有辨識力。 ");
                Assert.That(controlProxyOpen, Is.False,
                    "控制反例必須被 compound collision proxy 擋住，否則 proxy 只會放行而沒有碰撞辨識力。 ");
            }
        }

        private GameObject ImportRealModel(string modelFolder)
        {
#if UNITY_EDITOR
            var source = ModelPath(modelFolder, "model.glb");
            Assert.That(File.Exists(source), Is.True, "缺少 Gate 2 真實 GLB：" + source);
            var safeName = modelFolder.Replace('/', '-').Replace('\\', '-');
            var assetPath = generatedRoot + "/" + safeName + ".glb";
            var fullAssetPath = AssetPathToFullPath(assetPath);
            if (!File.Exists(fullAssetPath))
            {
                File.Copy(source, fullAssetPath, false);
                AssetDatabase.ImportAsset(assetPath, ImportAssetOptions.ForceSynchronousImport);
            }
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(assetPath);
            Assert.That(prefab, Is.Not.Null, "glTFast Editor importer 未產生 GameObject：" + modelFolder);

            var wrapper = new GameObject("IT-004 PlayMode glTF - " + safeName);
            roots.Add(wrapper);
            var instance = UnityEngine.Object.Instantiate(prefab, wrapper.transform);
            instance.name = "Imported glTF";
            // glTFast 已翻 X；純 Y 軸 180 度旋轉對齊本專案翻 Z 契約，不再鏡像或重翻三角形。
            instance.transform.localRotation = Quaternion.Euler(0, 180, 0) * instance.transform.localRotation;
            return wrapper;
#else
            Assert.Fail("IT-004 目前固定由 Unity Editor PlayMode runner 驗證 glTFast Editor 匯入結果。 ");
            return null;
#endif
        }

        private static void AddMeshColliders(GameObject root)
        {
            foreach (var filter in root.GetComponentsInChildren<MeshFilter>(true))
            {
                if (filter.sharedMesh == null) continue;
                var collider = filter.gameObject.GetComponent<MeshCollider>();
                if (collider == null) collider = filter.gameObject.AddComponent<MeshCollider>();
                collider.sharedMesh = filter.sharedMesh;
                collider.convex = false;
            }
        }

        private static bool HitsFixture(GameObject root, Vector3 start, Vector3 end, float radius)
        {
            var delta = end - start;
            var length = delta.magnitude;
            Assert.That(length, Is.GreaterThan(1e-6f), "插入探針必須有非零軸向長度。 ");
            Assert.That(radius, Is.GreaterThan(0));
            var axis = delta / length;
            var reference = Math.Abs(Vector3.Dot(axis, Vector3.up)) > 0.9f ? Vector3.right : Vector3.up;
            var radialA = Vector3.Cross(axis, reference).normalized;
            var radialB = Vector3.Cross(axis, radialA).normalized;
            var offsets = new List<Vector3> { Vector3.zero };
            foreach (var ring in new[] { radius * 0.5f, radius * 0.95f })
            {
                const int samples = 16;
                for (var index = 0; index < samples; index++)
                {
                    var angle = 2f * Mathf.PI * index / samples;
                    offsets.Add(radialA * (Mathf.Cos(angle) * ring) + radialB * (Mathf.Sin(angle) * ring));
                }
            }

            var previousBackfaces = Physics.queriesHitBackfaces;
            Physics.queriesHitBackfaces = true;
            try
            {
                foreach (var offset in offsets)
                {
                    var origin = start + offset;
                    if (Physics.RaycastAll(origin, axis, length, ~0, QueryTriggerInteraction.Ignore)
                        .Any(collider => collider.collider != null
                            && (collider.collider.gameObject == root || collider.collider.transform.IsChildOf(root.transform))))
                        return true;

                    foreach (var t in new[] { 0f, 0.5f, 1f })
                    {
                        var sample = Vector3.Lerp(start, end, t) + offset;
                        if (Physics.OverlapSphere(sample, 0.00005f, ~0, QueryTriggerInteraction.Ignore)
                            .Any(collider => collider != null
                                && (collider.gameObject == root || collider.transform.IsChildOf(root.transform))))
                            return true;
                    }
                }

                // 軸向 rays 檢查頂／底面；截面徑向 rays 補足平端圓柱側面與直立壁相交，仍不沿插入軸膨脹半徑。
                const int radialSamples = 24;
                foreach (var t in new[] { 0f, 0.25f, 0.5f, 0.75f, 1f })
                {
                    var center = Vector3.Lerp(start, end, t);
                    for (var index = 0; index < radialSamples; index++)
                    {
                        var angle = 2f * Mathf.PI * index / radialSamples;
                        var radial = radialA * Mathf.Cos(angle) + radialB * Mathf.Sin(angle);
                        if (Physics.RaycastAll(center, radial, radius * 0.99f, ~0, QueryTriggerInteraction.Ignore)
                            .Any(hit => hit.collider != null
                                && (hit.collider.gameObject == root || hit.collider.transform.IsChildOf(root.transform))))
                            return true;
                    }
                }
                return false;
            }
            finally
            {
                Physics.queriesHitBackfaces = previousBackfaces;
            }
        }

        private static Bounds RendererBounds(GameObject root)
        {
            var renderers = root.GetComponentsInChildren<Renderer>(true);
            Assert.That(renderers.Length, Is.GreaterThan(0), "匯入模型沒有 Renderer。 ");
            var bounds = renderers[0].bounds;
            for (var i = 1; i < renderers.Length; i++) bounds.Encapsulate(renderers[i].bounds);
            return bounds;
        }

        private static IEnumerable<Vector3> WorldVertices(GameObject root)
        {
            foreach (var filter in root.GetComponentsInChildren<MeshFilter>(true))
            {
                var mesh = filter.sharedMesh;
                if (mesh == null) continue;
                foreach (var vertex in mesh.vertices) yield return filter.transform.TransformPoint(vertex);
            }
        }

        private static double MirrorCoverage(IReadOnlyList<Vector3> points, Vector3 center, bool mirrorX)
        {
            const float quantum = 0.00002f;
            var set = new HashSet<string>(points.Select(point => Key(point, quantum)));
            var matched = 0;
            foreach (var point in points)
            {
                var mirrored = mirrorX
                    ? new Vector3(2 * center.x - point.x, point.y, point.z)
                    : new Vector3(point.x, point.y, 2 * center.z - point.z);
                if (set.Contains(Key(mirrored, quantum))) matched++;
            }
            return points.Count == 0 ? 0 : (double)matched / points.Count;
        }

        private static string Key(Vector3 point, float quantum) =>
            Math.Round(point.x / quantum) + ":" + Math.Round(point.y / quantum) + ":" + Math.Round(point.z / quantum);

        private static (int checkedTriangles, double agreement) WindingAgreement(GameObject root)
        {
            var checkedTriangles = 0;
            var aligned = 0;
            foreach (var filter in root.GetComponentsInChildren<MeshFilter>(true))
            {
                var mesh = filter.sharedMesh;
                if (mesh == null || mesh.normals == null || mesh.normals.Length != mesh.vertexCount) continue;
                var vertices = mesh.vertices;
                var normals = mesh.normals;
                var triangles = mesh.triangles;
                for (var i = 0; i + 2 < triangles.Length; i += 3)
                {
                    var i0 = triangles[i];
                    var i1 = triangles[i + 1];
                    var i2 = triangles[i + 2];
                    var a = filter.transform.TransformPoint(vertices[i0]);
                    var b = filter.transform.TransformPoint(vertices[i1]);
                    var c = filter.transform.TransformPoint(vertices[i2]);
                    var geometric = Vector3.Cross(b - a, c - a);
                    if (geometric.sqrMagnitude < 1e-16f) continue;
                    geometric.Normalize();
                    var normal = filter.transform.TransformDirection(normals[i0] + normals[i1] + normals[i2]);
                    if (normal.sqrMagnitude < 1e-12f) continue;
                    normal.Normalize();
                    checkedTriangles++;
                    if (Vector3.Dot(geometric, normal) > 0) aligned++;
                }
            }
            if (checkedTriangles == 0) return (0, 0);
            var sameDirectionRatio = (double)aligned / checkedTriangles;
            // Unity front-face 採 clockwise；Cross 正負號不應硬編成品質規則，只要求整體 winding 與 normals 有一致關係。
            return (checkedTriangles, Math.Max(sameDirectionRatio, 1d - sameDirectionRatio));
        }

        private static Vector3 ReadRecordedDimensions(string modelFolder, string metadataFile, bool boundsUnderGeometry)
        {
            var document = ReadEvidenceDocument(modelFolder, metadataFile);
            var bounds = boundsUnderGeometry ? document?.geometry?.boundsMeters : document?.boundsMeters;
            var path = ModelPath(modelFolder, metadataFile);
            Assert.That(bounds, Is.Not.Null, "證據未包含 boundsMeters：" + path);
            Assert.That(bounds.min, Has.Length.EqualTo(3));
            Assert.That(bounds.max, Has.Length.EqualTo(3));
            return new Vector3(
                bounds.max[0] - bounds.min[0],
                bounds.max[1] - bounds.min[1],
                bounds.max[2] - bounds.min[2]);
        }

        private static EvidenceDocument ReadEvidenceDocument(string modelFolder, string fileName)
        {
            var path = ModelPath(modelFolder, fileName);
            Assert.That(File.Exists(path), Is.True, "缺少幾何證據：" + path);
            return JsonUtility.FromJson<EvidenceDocument>(File.ReadAllText(path));
        }

        private static string[] CollisionFixtureNames()
        {
            var root = Path.Combine(BrickHighRoot(), "tools", "acceptance", "fixtures");
            Assert.That(Directory.Exists(root), Is.True, "缺少 Gate 2 collision fixture 目錄：" + root);
            return Directory.GetFiles(root, "gate2-*-collision.json")
                .Select(Path.GetFileName)
                .OrderBy(name => name, StringComparer.Ordinal)
                .ToArray();
        }

        private static CollisionFixtureDocument ReadCollisionFixture(string fixtureName)
        {
            var path = Path.Combine(BrickHighRoot(), "tools", "acceptance", "fixtures", fixtureName);
            Assert.That(File.Exists(path), Is.True, "缺少 Gate 2 collision fixture：" + path);
            var fixture = JsonUtility.FromJson<CollisionFixtureDocument>(File.ReadAllText(path));
            Assert.That(fixture, Is.Not.Null);
            return fixture;
        }

        private static Vector3d ToVector3d(float[] values)
        {
            Assert.That(values, Has.Length.EqualTo(3));
            return new Vector3d(values[0], values[1], values[2]);
        }

        private static Vector3 CanonicalToShiftedUnity(float[] values, float canonicalMinY)
        {
            Assert.That(values, Has.Length.EqualTo(3));
            return CanonicalToShiftedUnity(values[0], values[1], values[2], canonicalMinY);
        }

        private static Vector3 CanonicalToShiftedUnity(float x, float y, float z, float canonicalMinY)
        {
            var unity = CoordinatePolicy.ToUnity(new Vector3d(x, y, z));
            return new Vector3((float)unity.X, (float)unity.Y - canonicalMinY, (float)unity.Z);
        }

        private static string ModelPath(string modelFolder, string fileName) =>
            Path.Combine(BrickHighRoot(), "artifacts", "models", modelFolder.Replace('/', Path.DirectorySeparatorChar), fileName);

        private static string BrickHighRoot() => Path.GetFullPath(Path.Combine(UnityEngine.Application.dataPath, "..", ".."));

        private static string AssetPathToFullPath(string assetPath) =>
            Path.Combine(Path.GetDirectoryName(UnityEngine.Application.dataPath), assetPath.Replace('/', Path.DirectorySeparatorChar));
    }
}

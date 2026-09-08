"""啟用 Blender MCP 並建立 BrickHigh 的初始 Blender 場景。"""

from pathlib import Path

import bpy


PROJECT_ROOT = Path(r"C:\GitProjects\gamenenstyle\brickhigh")
BLEND_PATH = PROJECT_ROOT / "blender" / "brickhigh.blend"


def main() -> None:
    """啟用外掛、設定連接埠，並保存初始場景。"""
    bpy.ops.preferences.addon_enable(module="blender_mcp")
    bpy.ops.wm.save_userpref()

    scene = bpy.context.scene
    scene.blendermcp_port = 9876
    scene.blendermcp_auto_start_server = True
    scene["gamenenstyle_project"] = "brickhigh"
    scene["mcp_ready"] = True

    if not BLEND_PATH.exists():
        bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
        print(f"BrickHigh 初始 Blender 場景已保存至：{BLEND_PATH}")
    else:
        print(f"BrickHigh Blender 場景已存在，未覆寫：{BLEND_PATH}")

    server = getattr(bpy.types, "blendermcp_server", None)
    running = bool(server and server.running)
    scene.blendermcp_server_running = running
    print(f"Blender MCP 服務狀態：{'已啟動' if running else '未啟動'}，連接埠：{scene.blendermcp_port}")


main()

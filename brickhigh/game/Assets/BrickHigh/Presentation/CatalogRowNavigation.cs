using System;
using UnityEngine;
using UnityEngine.EventSystems;

namespace BrickHigh.Presentation
{
    /// <summary>將虛擬列的方向鍵事件交回清單；列池不能自行推算下一個資料項目。</summary>
    public sealed class CatalogRowNavigation : MonoBehaviour, IMoveHandler
    {
        internal int Index;
        internal Guid VariantId;
        internal Action<int, MoveDirection> Move;

        /// <summary>方向鍵只移動焦點，提交事件仍由原本的 Button 處理。</summary>
        public void OnMove(AxisEventData eventData)
        {
            if (eventData == null || !isActiveAndEnabled) return;
            Move?.Invoke(Index, eventData.moveDir);
            eventData.Use();
        }
    }
}

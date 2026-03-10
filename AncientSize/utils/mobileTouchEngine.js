export const dragState = {
    activeTouchDrag: null,
    dragAnimationFrame: null
};

export function initMobileTouchEngine(map) {
    const endTouchDrag = () => {
        if (dragState.activeTouchDrag) {
            dragState.activeTouchDrag = null;
            map.dragging.enable();

            if (map.dragging._draggable) {
                map.dragging._draggable._moving = false;
                map.dragging._draggable._lastEvent = null;
                if (typeof map.dragging._draggable._finishDrag === 'function') {
                    map.dragging._draggable._finishDrag();
                }
            }

            const stopEvent = new Event('touchend', { bubbles: true });
            stopEvent.touches = [];
            stopEvent.changedTouches = [{ clientX: 0, clientY: 0 }];
            map._container.dispatchEvent(stopEvent);

            const stopEventMouse = new MouseEvent('mouseup', {
                bubbles: true, clientX: 0, clientY: 0
            });
            map._container.dispatchEvent(stopEventMouse);
        }

        if (dragState.dragAnimationFrame) {
            cancelAnimationFrame(dragState.dragAnimationFrame);
            dragState.dragAnimationFrame = null;
        }
    };

    window.addEventListener('pointermove', (e) => {
        if (!dragState.activeTouchDrag) return;
        e.preventDefault();

        const mapContainer = map._container;
        const rect = mapContainer.getBoundingClientRect();
        const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
        const latlng = map.containerPointToLatLng(point);

        const newLat = latlng.lat + dragState.activeTouchDrag.offsetLat;
        const newLng = latlng.lng + dragState.activeTouchDrag.offsetLng;

        if (!dragState.dragAnimationFrame) {
            dragState.dragAnimationFrame = requestAnimationFrame(() => {
                if (dragState.activeTouchDrag) {
                    dragState.activeTouchDrag.layer.setCenter([newLat, newLng]);
                }
                dragState.dragAnimationFrame = null;
            });
        }
    }, { passive: false, capture: true });

    window.addEventListener('pointerup', endTouchDrag, { capture: true });
    window.addEventListener('pointercancel', endTouchDrag, { capture: true });
}
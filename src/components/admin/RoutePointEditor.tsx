'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { RoutePointEditorProps, RoutePoint } from '@/types';

const EMPTY_POINT: Omit<RoutePoint, 'order'> = {
  name: '',
  coordinates: { lat: 0, lng: 0 },
  description: '',
  tips: '',
};

export default function RoutePointEditor({
  routePoints,
  onRoutePointsChange,
}: RoutePointEditorProps) {
  const { t } = useLanguage();
  const [newPoint, setNewPoint] = useState<Omit<RoutePoint, 'order'>>(EMPTY_POINT);

  const reassignOrders = (points: RoutePoint[]): RoutePoint[] =>
    points.map((p, i) => ({ ...p, order: i + 1 }));

  const handleAdd = () => {
    const point: RoutePoint = {
      ...newPoint,
      order: routePoints.length + 1,
    };
    onRoutePointsChange(reassignOrders([...routePoints, point]));
    setNewPoint(EMPTY_POINT);
  };

  const handleRemove = (index: number) => {
    const updated = routePoints.filter((_, i) => i !== index);
    onRoutePointsChange(reassignOrders(updated));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...routePoints];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onRoutePointsChange(reassignOrders(updated));
  };

  const handleMoveDown = (index: number) => {
    if (index === routePoints.length - 1) return;
    const updated = [...routePoints];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onRoutePointsChange(reassignOrders(updated));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1e293b]/80 p-4 backdrop-blur-md">
      <h3 className="mb-4 text-sm font-semibold text-white/90">
        {t('admin.routePoints')}
      </h3>

      {/* Existing points list */}
      {routePoints.length === 0 && (
        <p className="mb-4 text-xs text-white/40" data-testid="empty-state">
          {t('admin.noContent')}
        </p>
      )}

      <div className="space-y-3">
        {routePoints.map((point, index) => (
          <div
            key={`${point.order}-${point.name}`}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
            data-testid={`route-point-${index}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-accent-turquoise">
                #{point.order}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="rounded px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 disabled:opacity-30"
                  data-testid={`move-up-${index}`}
                >
                  {t('admin.moveUp')}
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === routePoints.length - 1}
                  className="rounded px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 disabled:opacity-30"
                  data-testid={`move-down-${index}`}
                >
                  {t('admin.moveDown')}
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  className="rounded px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                  data-testid={`remove-${index}`}
                >
                  {t('admin.removePoint')}
                </button>
              </div>
            </div>
            <p className="text-sm font-medium text-white/80">{point.name}</p>
            <p className="text-xs text-white/50">{point.description}</p>
            {point.tips && (
              <p className="mt-1 text-xs italic text-amber-400/70">{point.tips}</p>
            )}
            <p className="mt-1 text-[10px] text-white/30">
              {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
            </p>
          </div>
        ))}
      </div>

      {/* Add new point form */}
      <div className="mt-4 space-y-3 rounded-xl border border-dashed border-white/10 p-3">
        <input
          type="text"
          placeholder={t('admin.pointName')}
          value={newPoint.name}
          onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-accent-turquoise"
          data-testid="new-point-name"
        />
        <input
          type="text"
          placeholder={t('admin.pointDescription')}
          value={newPoint.description}
          onChange={(e) => setNewPoint({ ...newPoint, description: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-accent-turquoise"
          data-testid="new-point-description"
        />
        <input
          type="text"
          placeholder={t('admin.pointTips')}
          value={newPoint.tips}
          onChange={(e) => setNewPoint({ ...newPoint, tips: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-accent-turquoise"
          data-testid="new-point-tips"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('admin.latitude')}
            value={newPoint.coordinates.lat || ''}
            onChange={(e) =>
              setNewPoint({
                ...newPoint,
                coordinates: { ...newPoint.coordinates, lat: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-1/2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-accent-turquoise"
            data-testid="new-point-lat"
          />
          <input
            type="number"
            placeholder={t('admin.longitude')}
            value={newPoint.coordinates.lng || ''}
            onChange={(e) =>
              setNewPoint({
                ...newPoint,
                coordinates: { ...newPoint.coordinates, lng: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-1/2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-accent-turquoise"
            data-testid="new-point-lng"
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full rounded-lg bg-accent-turquoise/20 py-2 text-sm font-medium text-accent-turquoise transition-all hover:bg-accent-turquoise/30 active:scale-[0.98]"
          data-testid="add-point-btn"
        >
          {t('admin.addRoutePoint')}
        </button>
      </div>
    </div>
  );
}

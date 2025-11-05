import React from "react";

export const MapContainer = ({ children }) => <div data-testid="map">{children}</div>;
export const TileLayer = () => <div data-testid="tile-layer" />;
export const Marker = () => <div data-testid="marker" />;
export const Popup = ({ children }) => <div data-testid="popup">{children}</div>;

// mocks simples de los hooks
export const useMap = jest.fn();
export const useMapEvent = jest.fn();
export const useMapEvents = jest.fn();

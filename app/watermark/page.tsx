"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function WatermarkPage() {
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState("#E5322D");
  return (
    <ToolShell
      title="Watermark PDF"
      description="Stamp a text watermark across every page of your PDF."
      endpoint="/api/watermark"
      accept={{ "application/pdf": [".pdf"] }}
      processLabel="Add watermark"
      requiresFields={!text.trim()}
      options={
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="wm-text">Watermark text</label>
            <input
              id="wm-text"
              className="input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="CONFIDENTIAL"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="wm-fs">Font size ({fontSize}pt)</label>
              <input
                id="wm-fs"
                type="range"
                min={10}
                max={150}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-brand"
              />
            </div>
            <div>
              <label className="label" htmlFor="wm-op">Opacity ({Math.round(opacity * 100)}%)</label>
              <input
                id="wm-op"
                type="range"
                min={5}
                max={100}
                step={5}
                value={Math.round(opacity * 100)}
                onChange={(e) => setOpacity(parseInt(e.target.value, 10) / 100)}
                className="w-full accent-brand"
              />
            </div>
            <div>
              <label className="label" htmlFor="wm-rot">Rotation ({rotation}°)</label>
              <input
                id="wm-rot"
                type="range"
                min={-90}
                max={90}
                step={5}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                className="w-full accent-brand"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="wm-color">Color</label>
            <input
              id="wm-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-200"
            />
          </div>
        </div>
      }
      buildFields={() => ({
        text,
        fontSize: String(fontSize),
        opacity: String(opacity),
        rotation: String(rotation),
        color,
      })}
    />
  );
}

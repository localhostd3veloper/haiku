import React from 'react';
import { usePointerFine } from 'react-haiku';

export const UsePointerFineDemo = () => {
  const hasFinePointer = usePointerFine();

  return (
    <div className="demo-container-center">
      {hasFinePointer
        ? "🖱️ You're using a mouse or other fine pointer!"
        : '📱 Touch or coarse pointer detected'}
    </div>
  );
};

import React from 'react';

export const PRESET_AVATARS = [
  { id: 'chef', name: 'Master Chef', icon: 'bi-hat-chef', color: '#F25C05' },
  { id: 'baker', name: 'Artisan Baker', icon: 'bi-egg-fried', color: '#ED6C02' },
  { id: 'chili', name: 'Spicy Chili', icon: 'bi-fire', color: '#D32F2F' },
  { id: 'avocado', name: 'Fresh Avocado', icon: 'bi-basket3', color: '#2E7D32' },
  { id: 'tomato', name: 'Juicy Tomato', icon: 'bi-sun', color: '#E53935' },
  { id: 'pancake', name: 'Fluffy Pancakes', icon: 'bi-layers-fill', color: '#F2994A' },
  { id: 'egg', name: 'Jammy Egg', icon: 'bi-brightness-high-fill', color: '#F2C94C' },
  { id: 'mushroom', name: 'Wild Mushroom', icon: 'bi-tree-fill', color: '#8D6E63' },
  { id: 'strawberry', name: 'Sweet Berry', icon: 'bi-heart-fill', color: '#EC407A' },
  { id: 'ramen', name: 'Ramen Bowl', icon: 'bi-cup-hot-fill', color: '#FF7043' },
  { id: 'whisk', name: 'Master Whisk', icon: 'bi-tools', color: '#42A5F5' },
  { id: 'pot', name: 'Cooking Pot', icon: 'bi-box-seam', color: '#78909C' }
];

export const AvatarDisplay = ({ avatar, size = 48, className = '' }) => {
  if (!avatar) {
    return (
      <div
        className={`rounded-circle d-inline-flex align-items-center justify-content-center text-white border border-dark ${className}`}
        style={{ width: size, height: size, backgroundColor: '#F25C05', fontSize: size * 0.5, boxShadow: '2px 2px 0px #111' }}
      >
        <i className="bi bi-person-fill"></i>
      </div>
    );
  }

  if (avatar.type === 'custom' && avatar.imageUrl) {
    return (
      <img
        src={avatar.imageUrl}
        alt="Profile Avatar"
        className={`rounded-circle border border-dark object-fit-cover ${className}`}
        style={{ width: size, height: size, boxShadow: '2px 2px 0px #111' }}
      />
    );
  }

  const preset = PRESET_AVATARS.find(p => p.id === (avatar.presetId || 'chef')) || PRESET_AVATARS[0];

  return (
    <div
      className={`rounded-circle d-inline-flex align-items-center justify-content-center text-white border border-dark ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: preset.color,
        fontSize: size * 0.5,
        boxShadow: '2px 2px 0px #111'
      }}
      title={preset.name}
    >
      <i className={`bi ${preset.icon}`}></i>
    </div>
  );
};

const PresetAvatarGrid = ({ selectedPresetId, onSelect }) => {
  return (
    <div className="preset-avatar-grid row g-2">
      {PRESET_AVATARS.map(preset => {
        const isSelected = selectedPresetId === preset.id;
        return (
          <div key={preset.id} className="col-3 col-md-2">
            <button
              type="button"
              className={`btn w-100 p-2 d-flex flex-column align-items-center justify-content-center rounded-3 border-dark transition-all ${isSelected ? 'btn-warning border-3 shadow' : 'btn-light border'}`}
              style={{
                borderColor: isSelected ? '#111111' : '#E8E2D6',
                boxShadow: isSelected ? '3px 3px 0px #111' : 'none'
              }}
              onClick={() => onSelect(preset.id)}
              aria-label={`Select ${preset.name} avatar`}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white mb-1"
                style={{ width: 40, height: 40, backgroundColor: preset.color, fontSize: '1.2rem' }}
              >
                <i className={`bi ${preset.icon}`}></i>
              </div>
              <small className="fw-bold text-truncate w-100 text-center" style={{ fontSize: '0.7rem' }}>
                {preset.name}
              </small>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PresetAvatarGrid;

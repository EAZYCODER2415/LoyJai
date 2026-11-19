import React from 'react';

const Background = () => {
  const imageBase = `${import.meta.env.BASE_URL}images/`;

  return (
    <div className="background" aria-hidden="true">
      <div className="top" style={{ backgroundImage: `url("${imageBase}skyline.png")` }}>
        <div className="moon">
          <img alt="" src={`${imageBase}moon.png`} />
        </div>
      </div>
      <div
        className="bottom"
        style={{ backgroundImage: `url("${imageBase}river_bg.png")` }}
      />
    </div>
  );
};

export default Background;

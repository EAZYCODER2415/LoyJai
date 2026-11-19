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
        style={{ background: 'transparent' }}
      />
      <div className="decor" aria-hidden="true">
        <img className="decor-lotus lotus-one" src={`${imageBase}lotus1.png`} alt="" />
        <img className="decor-cattail cattail-one" src={`${imageBase}cattail.png`} alt="" />
        <img className="decor-lotus lotus-two" src={`${imageBase}lotus1.png`} alt="" />
        <img className="decor-cattail cattail-two" src={`${imageBase}cattail.png`} alt="" />
        <img className="decor-lotus lotus-three" src={`${imageBase}lotus1.png`} alt="" />
        <img className="decor-cattail cattail-three" src={`${imageBase}cattail.png`} alt="" />
        <img className="decor-lotus lotus-four" src={`${imageBase}lotus1.png`} alt="" />
        <img className="decor-cattail cattail-four" src={`${imageBase}cattail.png`} alt="" />
        <img className="decor-lotus lotus-five" src={`${imageBase}lotus1.png`} alt="" />
      </div>
    </div>
  );
};

export default Background;

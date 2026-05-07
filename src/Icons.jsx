import React from 'react';

export const CoinIcon = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 6.35 6.35"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="coinGradient" x1="0" y1="3.175" x2="6.35" y2="3.175" gradientUnits="userSpaceOnUse">
        <stop offset="0" style={{ stopColor: '#d47100', stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: '#fcc100', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <ellipse
      style={{ fill: '#161616', stroke: 'url(#coinGradient)', strokeWidth: 0.513385 }}
      cx="3.175"
      cy="3.175"
      rx="2.987"
      ry="2.987"
    />
    <text
      x="3.175"
      y="4.2"
      textAnchor="middle"
      style={{ fontSize: '5.1px', fill: '#e6e6e6', fontWeight: 'bold' }}
    >
      B
    </text>
  </svg>
);

export const ShopIcon = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 6.35 6.35"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="shopGradient" x1="0" y1="3.175" x2="6.35" y2="3.175" gradientUnits="userSpaceOnUse">
        <stop offset="0" style={{ stopColor: '#d47100', stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: '#fcc100', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="scale(0.1)">
      <rect
        style={{ fill: 'none', stroke: 'url(#shopGradient)', strokeWidth: 3.248 }}
        width="42.56"
        height="27.77"
        x="19.43"
        y="23.24"
      />
      <rect
        style={{ fill: 'none', stroke: 'url(#shopGradient)', strokeWidth: 3.067 }}
        width="47.19"
        height="6.175"
        x="17.07"
        y="17.18"
        rx="1.323"
      />
      <rect
        style={{ fill: 'none', stroke: 'url(#shopGradient)', strokeWidth: 2.646 }}
        width="5.09"
        height="6.548"
        x="25.24"
        y="10.63"
        rx="0.143"
      />
      <rect
        style={{ fill: 'none', stroke: 'url(#shopGradient)', strokeWidth: 2.646 }}
        width="8.497"
        height="15.21"
        x="47.1"
        y="35.03"
        rx="0.238"
      />
      <rect
        style={{ fill: 'none', stroke: 'url(#shopGradient)', strokeWidth: 2.646 }}
        width="8.497"
        height="7.837"
        x="27.38"
        y="29.1"
        rx="0.238"
      />
    </g>
  </svg>
);

export const InventoryIcon = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 6.35 6.35"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="inventoryGradient" x1="0" y1="3.175" x2="6.35" y2="3.175" gradientUnits="userSpaceOnUse">
        <stop offset="0" style={{ stopColor: '#d47100', stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: '#fcc100', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="scale(0.045)">
      <rect
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 2.747 }}
        width="34.22"
        height="41.97"
        x="40.59"
        y="12.73"
        rx="5.658"
      />
      <rect
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 2.271 }}
        width="14.8"
        height="4.221"
        x="50.35"
        y="8.559"
        rx="1.357"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 1.058 }}
        d="M 47.35 24.02 h 20.69"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 1.058 }}
        d="M 47.35 29.25 h 20.69"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 1.058 }}
        d="M 47.35 34.48 h 20.69"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 1.058 }}
        d="M 47.35 39.71 h 20.69"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#inventoryGradient)', strokeWidth: 1.058 }}
        d="M 47.35 44.93 h 20.69"
      />
    </g>
  </svg>
);

export const MissionsIcon = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 6.35 6.35"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="missionsGradient" x1="0" y1="3.175" x2="6.35" y2="3.175" gradientUnits="userSpaceOnUse">
        <stop offset="0" style={{ stopColor: '#d47100', stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: '#fcc100', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="scale(0.1)">
      <rect
        style={{ fill: '#000', stroke: 'url(#missionsGradient)', strokeWidth: 2.646 }}
        width="44.98"
        height="31.75"
        x="9.28"
        y="18.94"
        rx="5.292"
      />
      <path
        style={{ fill: '#000', stroke: 'url(#missionsGradient)', strokeWidth: 2.646 }}
        d="M 9.42 28.23 H 53.41"
      />
      <path
        style={{ fill: '#000', stroke: 'url(#missionsGradient)', strokeWidth: 2.646 }}
        d="m 25.81 28.34 c 0 1.233 0 2.465 0 3.3 0 0.834 0 1.271 0.317 1.489 0.317 0.218 0.951 0.218 1.752 0.218 0.801 0 1.77 0 2.738 0"
      />
      <path
        style={{ fill: '#000', stroke: 'url(#missionsGradient)', strokeWidth: 2.646 }}
        d="m 37.73 28.34 c 0 1.233 0 2.465 0 3.3 0 0.834 0 1.271 -0.317 1.489 -0.317 0.218 -0.951 0.218 -1.752 0.218 -0.801 0 -1.77 0 -2.738 0"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#missionsGradient)', strokeWidth: 2.646 }}
        d="m 21.12 18.63 c 0 -1.576 0 -3.153 0 -4.122 0 -0.969 0 -1.33 0.189 -1.511 0.189 -0.181 0.566 -0.181 2.178 -0.181 1.612 0 4.457 0 7.303 0"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#missionsGradient)', strokeWidth: 2.646 }}
        d="m 42.41 18.63 c 0 -1.576 0 -3.153 0 -4.122 0 -0.969 0 -1.33 -0.189 -1.511 -0.189 -0.181 -0.566 -0.181 -2.178 -0.181 -1.612 0 -4.457 0 -7.303 0"
      />
    </g>
  </svg>
);

export const LevelIcon = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 6.35 6.35"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="levelGradient" x1="0" y1="3.175" x2="6.35" y2="3.175" gradientUnits="userSpaceOnUse">
        <stop offset="0" style={{ stopColor: '#d47100', stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: '#fcc100', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="scale(0.12)">
      <rect
        style={{ fill: 'none', stroke: 'url(#levelGradient)', strokeWidth: 2.646 }}
        width="52.53"
        height="30.9"
        x="0"
        y="14.97"
        rx="5.993"
      />
      <text
        x="26.27"
        y="38"
        textAnchor="middle"
        style={{ fontSize: '24px', fill: 'none', stroke: 'url(#levelGradient)', strokeWidth: 1.5, fontWeight: 'bold' }}
      >
        LVL
      </text>
    </g>
  </svg>
);

export const AuctionIcon = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 6.35 6.35"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="auctionGradient" x1="0" y1="3.175" x2="6.35" y2="3.175" gradientUnits="userSpaceOnUse">
        <stop offset="0" style={{ stopColor: '#d47100', stopOpacity: 1 }} />
        <stop offset="1" style={{ stopColor: '#fcc100', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="scale(0.02)">
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 2.646 }}
        d="m 270.49 12.26 c 7.484 0 14.967 0 20.617 1.22 5.649 1.22 9.465 3.66 11.4 5.201 1.936 1.542 1.991 2.185 0.245 3.224 -1.746 1.038 -5.294 2.472 -8.21 3.257 -2.916 0.786 -5.201 0.924 -9.043 1.042 -3.842 0.119 -9.242 0.218 -14.643 0.317"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 2.646 }}
        d="m 270.1 12.1 c -4.301 0.801 -8.602 1.602 -11.157 3.363 -2.555 1.76 -3.364 4.48 -3.503 6.226 -0.139 1.746 0.391 2.517 2.051 3.314 1.66 0.797 4.448 1.619 6.842 1.919 2.393 0.301 4.391 0.08 6.388 -0.141"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 2.646 }}
        d="m 270.21 25.6 c 0.26 -2.163 0.519 -4.326 0.489 -6.5 -0.03 -2.174 -0.35 -4.359 -0.67 -6.545"
      />
      <ellipse
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 2.646 }}
        cx="264.47"
        cy="17.98"
        rx="0.804"
        ry="0.735"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 1.323 }}
        d="m 275.13 17.45 c 0.085 0.927 0.255 2.78 0.522 3.753 0.268 0.973 0.633 1.066 2.392 1.065 1.759 -0.002 4.911 -0.098 5.913 -0.447 1.002 -0.349 -0.148 -0.95 0.107 -1.423 0.255 -0.473 1.913 -0.819 0.644 -1.443 -1.269 -0.624 -5.466 -1.528 -7.565 -1.98 -2.099 -0.452 -2.099 -0.452 -2.014 0.475 z"
      />
      <rect
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 2.646 }}
        width="42.84"
        height="17.01"
        x="260.56"
        y="37.62"
        rx="2.47"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 1.323 }}
        d="m 284.27 41.98 c -1.589 -0.131 -3.179 -0.263 -4.071 0.336 -0.892 0.599 -1.086 1.928 -0.277 2.76 0.809 0.832 2.622 1.168 3.474 1.861 0.852 0.693 0.743 1.743 -0.2 2.337 -0.943 0.594 -2.722 0.732 -4.501 0.87"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 0.794 }}
        d="m 281.14 40.38 v 11.4"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 0.794 }}
        d="m 282.83 40.38 v 11.4"
      />
      <path
        style={{ fill: 'none', stroke: 'url(#auctionGradient)', strokeWidth: 2.646 }}
        d="m 300.79 17.15 c 2.197 -0.96 4.395 -1.921 5.68 -2.284 1.286 -0.364 1.66 -0.132 1.79 1.908 0.13 2.04 0.016 5.889 -0.241 7.971 -0.257 2.083 -0.657 2.401 -1.854 1.878 -1.197 -0.522 -3.191 -1.885 -5.186 -3.248"
      />
    </g>
  </svg>
);

export const FishingButtonIcon = ({ className = '', size = 260 }) => (
  <img
    src="/Icons/BlobisLogo.png"
    alt="Fishing"
    className={className}
    style={{ width: size, height: size }}
  />
);

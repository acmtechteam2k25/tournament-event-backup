import React from 'react';
import './ReleasingSoon.css';
import bg1 from '../assets/bg1.jpg';

function Wheel({ size = 120, speed = '3s', stroke = 6, reverse = false, color = '#9b7cff', teeth = 12 }) {
	const transform = reverse ? 'reverse' : 'normal';
	const toothCount = teeth;
	const teethEls = [];
	const outerR = 40;
	const toothW = 5;
	const toothH = 8;

	for (let i = 0; i < toothCount; i++) {
		const angle = (i * 360) / toothCount;
		teethEls.push(
			<rect
				key={i}
				className="wheel-tooth"
				x={50 - toothW / 2}
				y={50 - outerR - toothH}
				width={toothW}
				height={toothH}
				rx={1}
				transform={`rotate(${angle} 50 50)`}
				fill={color}
			/>
		);
	}

	return (
		<svg
			className="releasing-wheel"
			width={size}
			height={size}
			viewBox="0 0 100 100"
			aria-hidden="true"
			role="img"
			style={{ ['--wheel-speed']: speed, ['--wheel-stroke']: `${stroke}px`, ['--wheel-anim-dir']: transform }}
		>
			<g className="rotator">
				{teethEls}
				<circle className="wheel-ring" cx="50" cy="50" r="36" fill="none" strokeWidth={stroke} stroke={color} />
				<circle cx="50" cy="50" r="14" fill={color} opacity={0.12} />
			</g>
		</svg>
	);
}

export default function ReleasingSoon() {
	return (
		<div
			className="releasing-soon-root"
			
		>
			{/* background dimmer layer */}
			<div className="releasing-soon-backdrop" />

			<div className="dm-serif-display-regular releasing-soon-glass" role="region" aria-label="Releasing Soon">
				<h1 className="rs-title">Releasing Soon</h1>

						<div className="rs-wheels" aria-hidden="true">
							<div className="wheel-wrap w1">
								<Wheel size={180} speed={'5s'} stroke={5} reverse={false} color={'#d4af37'} teeth={14} />
							</div>

							<div className="wheel-wrap w2">
								<Wheel size={100} speed={'2.8s'} stroke={4} reverse={false} color={'#b36b2c'} teeth={10} />
							</div>

							<div className="wheel-wrap w3">
								<Wheel size={120} speed={'3.2s'} stroke={4} reverse={true} color={'#ffd27a'} teeth={12} />
							</div>
						</div>

				<p className="rs-subtitle">Bracket view is under construction — check back soon.</p>
			</div>
		</div>
	);
}

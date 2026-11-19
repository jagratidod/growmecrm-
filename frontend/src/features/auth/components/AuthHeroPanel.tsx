import React from 'react'

export interface AuthHeroPanelProps {
  title?: string
  headline?: string
  description?: string
}

export const AuthHeroPanel: React.FC<AuthHeroPanelProps> = ({
  title = 'WELCOME',
  headline = 'YOUR HEADLINE NAME',
  description = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam.',
}) => {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[640px] flex flex-col justify-center px-10 sm:px-14 lg:px-20 py-16 overflow-hidden bg-gradient-to-br from-[#0e56b8] via-[#094ca7] to-[#06377e] text-white select-none">
      {/* 3D Sphere Elements matching reference */}
      
      {/* Massive Top-Right Organic Curve / Sphere that bulges into the right section */}
      <div
        className="absolute -top-12 -right-28 sm:-right-20 lg:-right-32 w-[340px] sm:w-[440px] lg:w-[540px] h-[340px] sm:h-[440px] lg:h-[540px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #1a70e0 0%, #0b50b2 45%, #053377 85%)',
          boxShadow: '0 25px 60px -15px rgba(2, 26, 62, 0.45)',
        }}
      />

      {/* Bottom Center / Floating Main Sphere */}
      <div
        className="absolute -bottom-16 sm:-bottom-20 left-[35%] sm:left-[38%] w-[260px] sm:w-[320px] lg:w-[360px] h-[260px] sm:h-[320px] lg:h-[360px] rounded-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at 32% 28%, #1f77ec 0%, #0d54b8 48%, #052f6b 90%)',
          boxShadow: '-10px 20px 50px rgba(1, 19, 48, 0.55)',
        }}
      />

      {/* Bottom Left Deep Sphere */}
      <div
        className="absolute -bottom-24 -left-16 sm:-left-20 w-[240px] sm:w-[300px] lg:w-[340px] h-[240px] sm:h-[300px] lg:h-[340px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 38% 30%, #1563cc 0%, #084399 50%, #032455 92%)',
          boxShadow: '0 20px 45px rgba(2, 22, 53, 0.5)',
        }}
      />

      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Typography & Content */}
      <div className="relative z-20 max-w-md space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
          {title}
        </h1>

        <h2 className="text-sm sm:text-base lg:text-lg font-bold tracking-[0.2em] text-white/95 uppercase">
          {headline}
        </h2>

        <div className="w-12 h-1 bg-white/40 rounded-full my-3"></div>

        <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal pt-1 max-w-sm">
          {description}
        </p>
      </div>
    </div>
  )
}

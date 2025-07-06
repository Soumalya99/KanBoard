import React from 'react'

const SkeletonLoader = ({width = "100%", height = "2rem", className = ""}) => {
  return (
    <div
        className={`animate-pulse bg-gray-300 rounded ${className}`}
        style={{ width, height }}
        aria-label="Loading"
    />
  )
}

export default SkeletonLoader;


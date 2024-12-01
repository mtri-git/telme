'use client';
import VideoConference from '@/components/base/videoConference'
import { useAuth } from '@/context/authContext';
import React from 'react'

export default function VideoCallPage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">Please login to join the meeting</h1>
      </div>
    )
  }

  return (
    <>
        <VideoConference roomId={'we-meet'}/>
    </>
  )
}

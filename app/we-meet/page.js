'use client';
import VideoConference from '@/components/base/videoConference'
import { useAuth } from '@/context/authContext';
import { useState, useEffect } from 'react'

export default function VideoCallPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [code, setCode] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    setCode(code);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">Please login to join the meeting</h1>
      </div>
    )
  }

  return (
    <>
        <VideoConference roomId={code}/>
    </>
  )
}

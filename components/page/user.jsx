'use client';
import React, { useEffect, useState } from 'react'
import axiosInstance from '@/utils/axios'

export default function UserList() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        axiosInstance.get('/users').then(response => {
            setUsers(response.data.data)
        }).catch(error => {
            console.error('Error loading users', error)
            setLoading(false)
        }).finally(() => {
            setLoading(false)
        })
    }
    , [])

  return (
    <>
        {loading ? (
            <p>Loading...</p>
        ) : (
            <ul>
            {users && users?.map(user => (
                <li key={user._id}>{user.email}</li>
            ))}
            </ul>
        )}
    </>
  )
}

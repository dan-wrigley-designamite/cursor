'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const isActive = (path) => pathname === path

  const menuItems = [
    { 
      label: 'Home',
      path: '/',
      icon: '🏠'
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊'
    },
    {
      label: 'API Playground',
      path: '/dashboard/playground',
      icon: '⚡'
    }
  ]

  return (
    <div className={`h-screen bg-gray-800 text-white transition-all duration-300 rounded-tr-lg rounded-br-lg ${
      isOpen ? 'w-64' : 'w-0'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
      >
        {isOpen ? '←' : '→'}
      </button>

      <div className={`${!isOpen && 'hidden'}`}>
        {/* Logo */}
        <div className="p-6 mt-12">
          <Link href="/">
            <span className="text-xl font-bold">Dandi</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-6 py-3 text-sm ${
                isActive(item.path)
                  ? 'bg-gray-700 border-l-4 border-blue-500'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
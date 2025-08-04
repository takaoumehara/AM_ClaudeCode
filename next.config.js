/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['ui-avatars.com', 'firebasestorage.googleapis.com'],
  },
  transpilePackages: [
    '@tamagui/core',
    '@tamagui/animations-react-native',
    '@tamagui/config',
    '@tamagui/font-inter',
    '@tamagui/theme-base',
    '@tamagui/button',
    '@tamagui/card',
    '@tamagui/input',
    '@tamagui/text',
    '@tamagui/select',
    '@tamagui/sheet',
    '@tamagui/toast',
    '@tamagui/avatar',
    '@tamagui/separator',
    '@tamagui/stacks',
    '@tamagui/shorthands',
  ],
}

module.exports = nextConfig
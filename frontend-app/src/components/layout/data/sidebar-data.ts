import {
  IconBrowserCheck,
  IconLock,
  IconNotification,
  IconPalette,
  IconLogin,
  IconKey,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconBuildingStore,
  IconTags,
  IconDashboard,
  IconVolume,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Barclays',
      logo: Command,
      plan: 'OffersHub',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconDashboard,
        },
        {
          title: 'Offers',
          url: '/offers',
          icon: IconTags,
        },
        {
          title: 'Campaigns',
          url: '/campaigns',
          icon: IconVolume,
        },
      ],
    },
    {
      title: 'Manage Tenants',
      items: [
        {
          title: 'Tenants',
          url: '/tenants',
          icon: IconBuildingStore,
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
      ],
    },
    {
      title: 'Auth',
      items: [
        {
          title: 'Sign In',
          url: '/sign-in',
          icon: IconLogin,
        },
        {
          title: 'Forgot Password',
          url: '/forgot-password',
          icon: IconKey,
        },
      ],
    },
    // {
      // title: 'Pages',
      // items: [
      //   {
      //     title: 'Auth',
      //     icon: IconLock,
      //     items: [
      //       {
      //         title: 'Sign In',
      //         url: '/sign-in',
      //       },
      //       {
      //         title: 'Forgot Password',
      //         url: '/forgot-password',
      //       },
      //     ],
      //   },
      //   // {
      //   //   title: 'Errors',
      //   //   icon: IconBug,
      //   //   items: [
      //   //     {
      //   //       title: 'Unauthorized',
      //   //       url: '/401',
      //   //       icon: IconLock,
      //   //     },
      //   //     {
      //   //       title: 'Forbidden',
      //   //       url: '/403',
      //   //       icon: IconUserOff,
      //   //     },
      //   //     {
      //   //       title: 'Not Found',
      //   //       url: '/404',
      //   //       icon: IconError404,
      //   //     },
      //   //     {
      //   //       title: 'Internal Server Error',
      //   //       url: '/500',
      //   //       icon: IconServerOff,
      //   //     },
      //   //     {
      //   //       title: 'Maintenance Error',
      //   //       url: '/503',
      //   //       icon: IconBarrierBlock,
      //   //     },
      //   //   ],
      //   // },
      // ],
    // },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
      ],
    },
  ],
}

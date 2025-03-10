import { type Metadata } from 'next'
import { SimpleLayout } from '@/components/layout/SimpleLayout'

import { friendsHeadLine, friendsIntro, friends } from '@/config/infoConfig'

import { FriendCard } from '@/components/friends/FriendCard'

export const metadata: Metadata = {
  title: 'Friends',
  description: friendsHeadLine,
}

export default function Friends() {
  return (
    <>
      <style jsx global>{`
        /* Smooth scrolling only for this page */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <SimpleLayout
        title={friendsHeadLine}
        intro={friendsIntro}
      >
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 pb-10"
        >
          {friends.map((friend) => (
            <FriendCard key={friend.name} friend={friend} />
          ))}
        </ul>
      </SimpleLayout>
    </>
  )
}

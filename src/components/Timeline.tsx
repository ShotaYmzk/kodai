import React from 'react';
import { User } from 'lucide-react';

interface TweetProps {
  text: string;
}

export function Tweet({ text }: TweetProps) {
  return (
    <div className="border-b border-[#eff3f4] p-4 flex hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-white">
        <User size={24} />
      </div>
      <div className="flex-grow">
        <div className="flex items-center mb-1">
          <span className="font-bold mr-1 text-[#0f1419]">User</span>
          <span className="text-[#536471] text-sm">@user</span>
        </div>
        <div className="text-[#0f1419] whitespace-pre-wrap leading-normal">
          {text}
        </div>
      </div>
    </div>
  );
}

export function Timeline({ posts }: { posts: { text: string }[] }) {
  return (
    <div className="pb-20">
      {posts.map((post, i) => (
        <Tweet key={i} text={post.text} />
      ))}
    </div>
  );
}


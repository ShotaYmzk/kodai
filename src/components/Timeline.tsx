'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share2, 
  MoreHorizontal,
  User
} from 'lucide-react';

interface TweetProps {
  text: string;
  index: number;
}

function Tweet({ text, index }: TweetProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 1000) + 1);
  const [retweetCount, setRetweetCount] = useState(Math.floor(Math.random() * 100) + 1);
  const [replyCount, setReplyCount] = useState(Math.floor(Math.random() * 50) + 1);

  // Generate random user data for each tweet
  const usernames = ['user', 'twitter_user', 'social_user', 'netizen', 'online_user', 'web_user'];
  const displayNames = ['User', 'Twitter User', 'Social User', 'Netizen', 'Online User', 'Web User'];
  const userIndex = index % usernames.length;
  const username = usernames[userIndex];
  const displayName = displayNames[userIndex];

  // Generate consistent avatar gradient based on index
  const avatarColors = [
    'from-blue-400 to-purple-500',
    'from-pink-400 to-red-500',
    'from-green-400 to-teal-500',
    'from-yellow-400 to-orange-500',
    'from-indigo-400 to-blue-500',
    'from-purple-400 to-pink-500',
  ];
  const avatarGradient = avatarColors[userIndex % avatarColors.length];

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetweeted(!isRetweeted);
    setRetweetCount(prev => isRetweeted ? prev - 1 : prev + 1);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    // UI only - no actual reply functionality
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // UI only - no actual share functionality
  };

  return (
    <div 
      className="border-b border-[#2f3336] hover:bg-[#16181c] transition-colors cursor-pointer"
      data-post-index={index}
    >
      <div className="px-4 pt-3 pb-2 flex">
        {/* Avatar */}
        <div className="mr-3 flex-shrink-0">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg`}>
            {displayName.charAt(0)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          {/* Header */}
          <div className="flex items-center mb-1">
            <span className="font-bold text-white hover:underline mr-1">
              {displayName}
            </span>
            <span className="text-[#71767a] text-[15px] mr-2">
              @{username}
            </span>
            <span className="text-[#71767a] text-[15px]">·</span>
            <span className="text-[#71767a] text-[15px] ml-2 hover:underline">
              {Math.floor(Math.random() * 24) + 1}h
            </span>
            <div className="ml-auto">
              <button className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors group">
                <MoreHorizontal size={18} className="text-[#71767a] group-hover:text-[#1d9bf0]" />
              </button>
            </div>
          </div>

          {/* Tweet Text */}
          <div className="text-white text-[15px] leading-[20px] mb-3 whitespace-pre-wrap break-words">
            {text}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between max-w-[425px] mt-3 mb-1">
            {/* Reply */}
            <button
              onClick={handleReply}
              className="flex items-center group -ml-2"
            >
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <MessageCircle 
                  size={18} 
                  className="text-[#536471] group-hover:text-[#1d9bf0]" 
                />
              </div>
              {replyCount > 0 && (
                <span className="text-[#71767a] text-[13px] ml-1 group-hover:text-[#1d9bf0]">
                  {replyCount}
                </span>
              )}
            </button>

            {/* Retweet */}
            <button
              onClick={handleRetweet}
              className="flex items-center group -ml-2"
            >
              <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                <Repeat2 
                  size={18} 
                  className={`text-[#71767a] group-hover:text-[#00ba7c] ${isRetweeted ? 'text-[#00ba7c]' : ''}`}
                />
              </div>
              {retweetCount > 0 && (
                <span className={`text-[13px] ml-1 group-hover:text-[#00ba7c] ${isRetweeted ? 'text-[#00ba7c]' : 'text-[#71767a]'}`}>
                  {retweetCount}
                </span>
              )}
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className="flex items-center group -ml-2"
            >
              <div className="p-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                <Heart 
                  size={18} 
                  className={`transition-colors ${isLiked ? 'fill-[#f91880] text-[#f91880]' : 'text-[#71767a] group-hover:text-[#f91880]'}`}
                />
              </div>
              {likeCount > 0 && (
                <span className={`text-[13px] ml-1 group-hover:text-[#f91880] ${isLiked ? 'text-[#f91880]' : 'text-[#71767a]'}`}>
                  {likeCount}
                </span>
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center group -ml-2"
            >
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <Share2 
                  size={18} 
                  className="text-[#71767a] group-hover:text-[#1d9bf0]" 
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineProps {
  posts: { text: string }[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const POSTS_PER_LOAD = 15;
const SCROLL_THRESHOLD = 300;

export function Timeline({ posts, containerRef: externalContainerRef }: TimelineProps) {
  const [displayedPosts, setDisplayedPosts] = useState<{ text: string; index: number }[]>([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const containerRef = externalContainerRef || internalContainerRef;

  useEffect(() => {
    if (posts.length === 0) {
      setDisplayedPosts([]);
      setCurrentPostIndex(0);
      setIsLooping(false);
      return;
    }

    const initialPosts = posts.slice(0, Math.min(POSTS_PER_LOAD, posts.length)).map((post, i) => ({
      text: post.text,
      index: i
    }));
    setDisplayedPosts(initialPosts);
    setCurrentPostIndex(Math.min(POSTS_PER_LOAD, posts.length));
    setIsLooping(false);
    loadingRef.current = false;
  }, [posts]);

  const loadMorePosts = useCallback(() => {
    if (loadingRef.current || posts.length === 0) return;
    
    loadingRef.current = true;

    const nextPosts: { text: string; index: number }[] = [];
    
    for (let i = 0; i < POSTS_PER_LOAD; i++) {
      const postIndex = (currentPostIndex + i) % posts.length;
      nextPosts.push({
        text: posts[postIndex].text,
        index: displayedPosts.length + i
      });
    }

    setDisplayedPosts(prev => [...prev, ...nextPosts]);
    const newIndex = (currentPostIndex + POSTS_PER_LOAD) % posts.length;
    setCurrentPostIndex(newIndex);
    
    if (currentPostIndex + POSTS_PER_LOAD >= posts.length) {
      setIsLooping(true);
    }

    setTimeout(() => {
      loadingRef.current = false;
    }, 200);
  }, [currentPostIndex, displayedPosts.length, posts]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
          loadMorePosts();
        }
        return;
      }

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
        loadMorePosts();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      setTimeout(() => {
        if (container.scrollHeight <= container.clientHeight + SCROLL_THRESHOLD) {
          loadMorePosts();
        }
      }, 100);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setTimeout(() => {
        if (document.documentElement.scrollHeight <= window.innerHeight + SCROLL_THRESHOLD) {
          loadMorePosts();
        }
      }, 100);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loadMorePosts, containerRef]);

  return (
    <div ref={internalContainerRef} className="pb-20">
      {displayedPosts.map((post) => (
        <Tweet key={`${post.index}-${post.text.substring(0, 20)}`} text={post.text} index={post.index} />
      ))}
      {isLooping && displayedPosts.length > 0 && (
        <div className="text-center py-4 text-[#71767a] text-sm border-t border-[#2f3336]">
          🔄 ループ中... 続きを読み込んでいます
        </div>
      )}
    </div>
  );
}

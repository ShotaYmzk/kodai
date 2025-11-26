'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { User } from 'lucide-react';

interface TweetProps {
  text: string;
  index: number;
}

export function Tweet({ text, index }: TweetProps) {
  return (
    <div className="border-b border-[#eff3f4] p-4 flex hover:bg-gray-50 transition-colors" data-post-index={index}>
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

interface TimelineProps {
  posts: { text: string }[];
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const POSTS_PER_LOAD = 15; // 一度に表示する投稿数
const SCROLL_THRESHOLD = 300; // スクロール位置の閾値（px）

export function Timeline({ posts, containerRef: externalContainerRef }: TimelineProps) {
  const [displayedPosts, setDisplayedPosts] = useState<{ text: string; index: number }[]>([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0); // 元のposts配列のインデックス
  const [isLooping, setIsLooping] = useState(false);
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const containerRef = externalContainerRef || internalContainerRef;

  // 初期表示と投稿が変更された時の処理
  useEffect(() => {
    if (posts.length === 0) {
      setDisplayedPosts([]);
      setCurrentPostIndex(0);
      setIsLooping(false);
      return;
    }

    // 最初のPOSTS_PER_LOAD件を表示
    const initialPosts = posts.slice(0, Math.min(POSTS_PER_LOAD, posts.length)).map((post, i) => ({
      text: post.text,
      index: i
    }));
    setDisplayedPosts(initialPosts);
    setCurrentPostIndex(Math.min(POSTS_PER_LOAD, posts.length));
    setIsLooping(false);
    loadingRef.current = false;
  }, [posts]);

  // 次の投稿を追加する関数
  const loadMorePosts = useCallback(() => {
    if (loadingRef.current || posts.length === 0) return;
    
    loadingRef.current = true;

    // 次のPOSTS_PER_LOAD件を取得（ループする）
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
    
    // ループしたかどうかをチェック
    if (currentPostIndex + POSTS_PER_LOAD >= posts.length) {
      setIsLooping(true);
    }

    // 少し遅延を入れてから次の読み込みを許可
    setTimeout(() => {
      loadingRef.current = false;
    }, 200);
  }, [currentPostIndex, displayedPosts.length, posts]);

  // スクロール監視（windowまたはコンテナ）
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) {
        // コンテナがない場合はwindowのスクロールを監視
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

      // 下に近づいたら次の投稿を読み込む
      if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
        loadMorePosts();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // 初期チェック：コンテンツが少ない場合はすぐに追加
      setTimeout(() => {
        if (container.scrollHeight <= container.clientHeight + SCROLL_THRESHOLD) {
          loadMorePosts();
        }
      }, 100);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      // 初期チェック
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
        <div className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
          🔄 ループ中... 続きを読み込んでいます
        </div>
      )}
    </div>
  );
}


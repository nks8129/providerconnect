'use client';

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, FileText, ChevronRight, Eye, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils';

export default function KnowledgePage() {
  const { knowledgeArticles } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Filter articles
  const filteredArticles = useMemo(() => {
    let result = knowledgeArticles;

    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }

    return result;
  }, [knowledgeArticles, searchQuery, selectedCategory]);

  const selectedArticleData = knowledgeArticles.find((a) => a.id === selectedArticle);

  // Group articles by category for sidebar
  const articlesByCategory = useMemo(() => {
    const groups: Record<string, typeof knowledgeArticles> = {};
    knowledgeArticles.forEach((article) => {
      if (!groups[article.category]) {
        groups[article.category] = [];
      }
      groups[article.category].push(article);
    });
    return groups;
  }, [knowledgeArticles]);

  return (
    <div className="h-full flex">
      {/* Sidebar - Categories */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Knowledge Base</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedArticle(null);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                !selectedCategory
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <BookOpen className="w-4 h-4" />
              All Articles
              <span className="ml-auto text-xs text-slate-400">{knowledgeArticles.length}</span>
            </button>

            <div className="mt-4 space-y-1">
              {CATEGORIES.map((category) => {
                const count = articlesByCategory[category.id]?.length || 0;
                if (count === 0) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedArticle(null);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="flex-1 truncate">{category.name}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Article List */}
          <ScrollArea className={cn('border-r border-slate-200 bg-white', selectedArticle ? 'w-80' : 'flex-1')}>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {filteredArticles.map((article) => {
                  const category = CATEGORIES.find((c) => c.id === article.category);
                  return (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article.id)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedArticle === article.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-slate-200 hover:border-primary-200 hover:bg-slate-50'
                      )}
                    >
                      <p className="text-sm font-medium text-slate-900">{article.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{category?.name}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {article.helpfulCount}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredArticles.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">No articles found</p>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Article Detail */}
          {selectedArticleData && (
            <div className="flex-1 overflow-auto">
              <div className="p-6 max-w-3xl">
                <div className="mb-6">
                  <Badge variant="outline" className="mb-2">
                    {CATEGORIES.find((c) => c.id === selectedArticleData.category)?.name}
                  </Badge>
                  <h1 className="text-2xl font-bold text-slate-900">{selectedArticleData.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedArticleData.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {selectedArticleData.helpfulCount} found helpful
                    </span>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedArticleData.content
                        .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
                        .replace(/^\d\. (.*$)/gm, '<li class="ml-4">$1</li>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>

                {selectedArticleData.checklist.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedArticleData.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded border-2 border-slate-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {selectedArticleData.tags.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs text-slate-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedArticleData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedArticle && filteredArticles.length > 0 && (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Select an article to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

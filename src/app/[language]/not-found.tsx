import { ArrowLeft, Languages } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-6">
          <Languages className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4">
          言語が見つかりません
        </h1>
        <p className="text-slate-400 mb-8">
          指定された言語は存在しないか、まだサポートされていません。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}

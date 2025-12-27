/// 記事モデル
class Article {
  final String id;
  final String title;
  final String? description;
  final String url;
  final String? imageUrl;
  final String source;
  final DateTime? publishedAt;
  final String? category;
  final String? difficulty;

  const Article({
    required this.id,
    required this.title,
    this.description,
    required this.url,
    this.imageUrl,
    required this.source,
    this.publishedAt,
    this.category,
    this.difficulty,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      url: json['url'] as String? ?? '',
      imageUrl: json['urlToImage'] as String? ?? json['imageUrl'] as String?,
      source: (json['source'] is Map)
          ? (json['source']['name'] as String? ?? '')
          : (json['source'] as String? ?? ''),
      publishedAt: json['publishedAt'] != null
          ? DateTime.tryParse(json['publishedAt'] as String)
          : null,
      category: json['category'] as String?,
      difficulty: json['difficulty'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'url': url,
      'imageUrl': imageUrl,
      'source': source,
      'publishedAt': publishedAt?.toIso8601String(),
      'category': category,
      'difficulty': difficulty,
    };
  }
}

/// 単語定義モデル
class WordDefinition {
  final String word;
  final String? phonetic;
  final String? partOfSpeech;
  final String? definition;
  final String? definitionJa;
  final String? example;

  const WordDefinition({
    required this.word,
    this.phonetic,
    this.partOfSpeech,
    this.definition,
    this.definitionJa,
    this.example,
  });

  factory WordDefinition.fromJson(Map<String, dynamic> json) {
    return WordDefinition(
      word: json['word'] as String? ?? '',
      phonetic: json['phonetic'] as String?,
      partOfSpeech: json['partOfSpeech'] as String?,
      definition: json['definition'] as String?,
      definitionJa: json['definitionJa'] as String?,
      example: json['example'] as String?,
    );
  }
}


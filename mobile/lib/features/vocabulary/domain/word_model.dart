/// 単語モデル
class Word {
  final String id;
  final String word;
  final String? pronunciation;
  final String category;
  final String meaning;
  final String? example;
  final String? exampleTranslation;
  final String? note;
  final String language;
  final bool check1;
  final bool check2;
  final bool check3;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Word({
    required this.id,
    required this.word,
    this.pronunciation,
    required this.category,
    required this.meaning,
    this.example,
    this.exampleTranslation,
    this.note,
    required this.language,
    this.check1 = false,
    this.check2 = false,
    this.check3 = false,
    this.createdAt,
    this.updatedAt,
  });

  factory Word.fromJson(Map<String, dynamic> json) {
    return Word(
      id: json['id'] as String,
      word: json['word'] as String,
      pronunciation: json['pronunciation'] as String?,
      category: json['category'] as String? ?? 'Other',
      meaning: json['meaning'] as String,
      example: json['example'] as String?,
      exampleTranslation: json['exampleTranslation'] as String?,
      note: json['note'] as String?,
      language: json['language'] as String? ?? 'english',
      check1: json['check1'] as bool? ?? false,
      check2: json['check2'] as bool? ?? false,
      check3: json['check3'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'word': word,
      'pronunciation': pronunciation,
      'category': category,
      'meaning': meaning,
      'example': example,
      'exampleTranslation': exampleTranslation,
      'note': note,
      'language': language,
      'check1': check1,
      'check2': check2,
      'check3': check3,
    };
  }

  Word copyWith({
    String? id,
    String? word,
    String? pronunciation,
    String? category,
    String? meaning,
    String? example,
    String? exampleTranslation,
    String? note,
    String? language,
    bool? check1,
    bool? check2,
    bool? check3,
  }) {
    return Word(
      id: id ?? this.id,
      word: word ?? this.word,
      pronunciation: pronunciation ?? this.pronunciation,
      category: category ?? this.category,
      meaning: meaning ?? this.meaning,
      example: example ?? this.example,
      exampleTranslation: exampleTranslation ?? this.exampleTranslation,
      note: note ?? this.note,
      language: language ?? this.language,
      check1: check1 ?? this.check1,
      check2: check2 ?? this.check2,
      check3: check3 ?? this.check3,
    );
  }

  /// 習得状況を計算（0-3）
  int get masteryLevel {
    int level = 0;
    if (check1) level++;
    if (check2) level++;
    if (check3) level++;
    return level;
  }

  /// 習得済みかどうか
  bool get isMastered => check1 && check2 && check3;
}


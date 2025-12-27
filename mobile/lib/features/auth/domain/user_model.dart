/// ユーザーモデル
class User {
  final String id;
  final String email;
  final String? name;
  final String? cefrLevel;
  final String? learningLanguage;
  final String? nativeLanguage;
  final DateTime? createdAt;

  const User({
    required this.id,
    required this.email,
    this.name,
    this.cefrLevel,
    this.learningLanguage,
    this.nativeLanguage,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String?,
      cefrLevel: json['cefrLevel'] as String?,
      learningLanguage: json['learningLanguage'] as String?,
      nativeLanguage: json['nativeLanguage'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'cefrLevel': cefrLevel,
      'learningLanguage': learningLanguage,
      'nativeLanguage': nativeLanguage,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? name,
    String? cefrLevel,
    String? learningLanguage,
    String? nativeLanguage,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      cefrLevel: cefrLevel ?? this.cefrLevel,
      learningLanguage: learningLanguage ?? this.learningLanguage,
      nativeLanguage: nativeLanguage ?? this.nativeLanguage,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}


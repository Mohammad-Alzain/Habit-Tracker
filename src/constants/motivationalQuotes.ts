export interface MotivationalQuote {
  id: number;
  text: string;
  author?: string;
  category: 'discipline' | 'morning' | 'streak' | 'small_steps' | 'resilience' | 'comeback' | 'focus';
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  // 1. الصباح والبدايات (Morning & Starting) - 35 quotes
  { id: 1, text: 'كل صباح هو فرصة جديدة لتكتب قصة نجاحك من السطر الأول.', author: 'روتين الصباح', category: 'morning' },
  { id: 2, text: 'ابدأ يومك بأول عادة، واجعل أول انتصار لك قبل أن يستيقظ العالم.', author: 'قوة العادات', category: 'morning' },
  { id: 3, text: 'أصعب خطوة في أي رحلة هي البداية، وبمجرد أن تبدأ ينتهي نصف العناء.', author: 'حكمة', category: 'morning' },
  { id: 4, text: 'طاقة الصباح كنز ثمين؛ استثمرها في بناء عاداتك قبل أن تتلاشى.', author: 'علم النفس', category: 'morning' },
  { id: 5, text: 'لا تنتظر اللحظة المثالية، خذ اللحظة الحالية واجعلها مثالية بعادتك.', author: 'تحفيز', category: 'morning' },
  { id: 6, text: 'الشمس تشرق كل يوم دون كلل، فلتكن عزيمتك مثلها في الإشراق.', author: 'تأمل', category: 'morning' },
  { id: 7, text: 'الصباح الناجح يصنع يوماً ناجحاً، واليوم الناجح يصنع حياة استثنائية.', author: 'روبن شارما', category: 'morning' },
  { id: 8, text: 'استيقظ بعزم وإصرار لتنام برضا وراحة بال.', author: 'جورج هوراس', category: 'morning' },
  { id: 9, text: 'افتح عينيك على أهدافك؛ اليوم يومك لتلوين خريطة إنجازاتك.', author: 'تحفيز', category: 'morning' },
  { id: 10, text: 'صباح الخير! خطوتك الأولى اليوم تنتظرك لتبدأ بها سلسلة الانتصارات.', author: 'إلهام', category: 'morning' },
  { id: 11, text: 'لا تؤجل عادة الصباح، فإنجازها يمنحك شحنة ثقة تلازمك حتى المساء.', author: 'جيمس كلير', category: 'morning' },
  { id: 12, text: 'كل فجر يحمل معه طاقة متجددة؛ وجهها نحو ما يبنيك.', author: 'تنمية ذاتية', category: 'morning' },
  { id: 13, text: 'الانتصار على رغبة النوم والكسل صباحاً هو أول درع تصنعه ليومك.', author: 'ماركوس أوريليوس', category: 'morning' },
  { id: 14, text: 'خمس دقائق تصنع فيها عادتك الصباحية خير من ساعات من التمني.', author: 'العادات الذرية', category: 'morning' },
  { id: 15, text: 'صباحك بداية جديدة، لا تحمل فيه ثقل الأمس بل ابدأ بصفحة ناصعة.', author: 'حكمة', category: 'morning' },
  { id: 16, text: 'الأشخاص العظماء يبنون مستقبلهم في الساعات الأولى من كل يوم.', author: 'بنجامين فرانكلين', category: 'morning' },
  { id: 17, text: 'إذا أتقنت أول ساعتين من يومك، فقد أتقنت اليوم كله.', author: 'تيم فيريس', category: 'morning' },
  { id: 18, text: 'دع أول فكرة تراودك اليوم: ماذا سأنجز لأكون فخوراً بنفسي الليلة؟', author: 'تحفيز', category: 'morning' },
  { id: 19, text: 'بدايتك المبكرة تمنحك هدوءاً وسبقاً على ضغوطات الحياة.', author: 'تطوير الذات', category: 'morning' },
  { id: 20, text: 'لا تبدأ يومك عشوائياً؛ جدولك وعاداتك هي بوصلتك نحو التميز.', author: 'ستيفن كوفي', category: 'morning' },
  { id: 21, text: 'الصباح يبتسم لمن يستقبله بالعمل والإنجاز.', author: 'إلهام', category: 'morning' },
  { id: 22, text: 'اجعل أول عادة لك بمثابة الشرارة التي تضيء بقية يومك.', author: 'قوة العادات', category: 'morning' },
  { id: 23, text: 'أجمل ما في الصباح أنه يمنحك فرصة تصحيح ما فات بالأمس.', author: 'أمل', category: 'morning' },
  { id: 24, text: 'صباح الهمة والنشاط، ركز على أول مهمة وأنهها بشغف.', author: 'تحفيز', category: 'morning' },
  { id: 25, text: 'حتى لو كان الجو غائماً، دع إشراقة إصرارك تنير دربك اليوم.', author: 'إلهام', category: 'morning' },
  { id: 26, text: 'كل دقيقة تستثمرها في صباحك ستعود عليك بأضعافها في إنجازك.', author: 'إنتاجية', category: 'morning' },
  { id: 27, text: 'نظم صباحك؛ وستجد أن بقية النهار تسير كما تحب وتتمنى.', author: 'علم النفس السلوكي', category: 'morning' },
  { id: 28, text: 'استيقظ وابتسم؛ لديك اليوم 1440 دقيقة لتحدث فرقاً حقيقياً.', author: 'حكمة', category: 'morning' },
  { id: 29, text: 'العادة الأولى في الصباح هي التي تضبط نغمة يومك بالكامل.', author: 'العادات الذرية', category: 'morning' },
  { id: 30, text: 'البداية نصف الإنجاز؛ ابدأ الآن دون تردد.', author: 'أرسطو', category: 'morning' },
  { id: 31, text: 'لا تفرط في التفكير صباحاً، خذ خطوة واحدة عملية للأمام.', author: 'تحفيز', category: 'morning' },
  { id: 32, text: 'يومك هو صورة مصغرة لحياتك؛ فلتكن بدايته قوية وواثقة.', author: 'فلسفة الحياة', category: 'morning' },
  { id: 33, text: 'الفرص لا تأتي لمن ينتظرها بل لمن يركض لاستقبالها كل صباح.', author: 'إلهام', category: 'morning' },
  { id: 34, text: 'صباح الإنجاز: أنجز أول نقطة في قائمتك لتشعر بلذة التقدم.', author: 'إنتاجية', category: 'morning' },
  { id: 35, text: 'اجعل روتينك الصباحي ملاذاً يمنحك السكينة والطاقة قبل معترك اليوم.', author: 'روتين القادة', category: 'morning' },

  // 2. الانضباط وبناء الروتين (Discipline & Systems) - 35 quotes
  { id: 36, text: 'أنت لا ترتقي إلى مستوى أهدافك، بل تهبط إلى مستوى أنظمتك وعاداتك.', author: 'جيمس كلير', category: 'discipline' },
  { id: 37, text: 'الانضباط هو الجسر المتين الممتد بين أهدافك وبين تحقيقها واقعياً.', author: 'جيم رون', category: 'discipline' },
  { id: 38, text: 'الانضباط الذاتي هو القدرة على فعل ما يلزم حتى عندما لا ترغب في فعله.', author: 'إبراهام لنكولن', category: 'discipline' },
  { id: 39, text: 'التحفيز هو ما يجعلك تبدأ، لكن الانضباط هو ما يبقيك مستمراً.', author: 'جيم ريون', category: 'discipline' },
  { id: 40, text: 'حرية الإنسان الحقيقية تنبع من قدرته على ضبط رغباته ونفسه.', author: 'إبيكتيتوس', category: 'discipline' },
  { id: 41, text: 'اختر ألم الانضباط اليوم، وإلا فستعاني من ألم الندم غداً.', author: 'حكمة القوة', category: 'discipline' },
  { id: 42, text: 'الروتين الصارم يمنحك عقلاً حراً وإبداعاً لا حدود له.', author: 'تطوير العقل', category: 'discipline' },
  { id: 43, text: 'أعظم معركة تخوضها في حياتك هي معركة السيطرة على نفسك وتوجيهها.', author: 'أفلاطون', category: 'discipline' },
  { id: 44, text: 'السر في تغيير حياتك يكمن في ما تفعله يومياً برتابة وإتقان.', author: 'جون ماكسويل', category: 'discipline' },
  { id: 45, text: 'الانضباط لا يعني قسوة، بل يعني أنك تحب نفسك بما يكفي لتبني مستقبلها.', author: 'تأمل نفسي', category: 'discipline' },
  { id: 46, text: 'لا تبحث عن الشغف كل يوم؛ ابنِ نظاماً يعمل سواء حضر الشغف أو غاب.', author: 'مارك مانسون', category: 'discipline' },
  { id: 47, text: 'العادة تصبح طبيعة ثانية عندما تمارسها بانضباط لا يتزعزع.', author: 'شيشرون', category: 'discipline' },
  { id: 48, text: 'من ملك زمام نفسه، ملك العالم من حوله.', author: 'حكمة شرقية', category: 'discipline' },
  { id: 49, text: 'الانضباط ليس عقاباً، بل هو أقصر الطرق لبناء احترام الذات.', author: 'علم النفس', category: 'discipline' },
  { id: 50, text: 'الناجحون يفعلون ما يكره الكسالى فعله، حتى وإن لم يكونوا في مزاج مناسب.', author: 'ألبيرت غراي', category: 'discipline' },
  { id: 51, text: 'ابنِ روتينك بوعي، وسيقوم روتينك ببنائك تلقائياً.', author: 'العادات الذرية', category: 'discipline' },
  { id: 52, text: 'عندما يصبح الانضباط نمط حياة، تصبح المعجزات اليومية أمراً معتاداً.', author: 'إلهام', category: 'discipline' },
  { id: 53, text: 'الإرادة مثل العضلة، كلما مرنتها على الرفض والالتزام كلما قويت.', author: 'روي باوميستر', category: 'discipline' },
  { id: 54, text: 'لا تستسلم للمزاج المتقلب؛ العادات الثابتة تنتصر دائماً على المزاج.', author: 'حكمة عملية', category: 'discipline' },
  { id: 55, text: 'كل قرار تتخذه لصالح انضباطك هو استثمار مباشر في كرامتك وثقتك.', author: 'تنمية بشرية', category: 'discipline' },
  { id: 56, text: 'النظام يهزم الفوضى في كل مرة؛ رتب عاداتك يرتبك يومك.', author: 'تحفيز', category: 'discipline' },
  { id: 57, text: 'الالتزام هو أن تفي بالوعد الذي قطعته لنفسك بعد أن تزول حماسة اللحظة.', author: 'تحفيز القيادة', category: 'discipline' },
  { id: 58, text: 'ما تفعله في الخفاء دون أن يراك أحد هو ما يحدد من تكون في العلن.', author: 'حكمة', category: 'discipline' },
  { id: 59, text: 'الانضباط يصنع الفارق بين من يتمنى ومن ينفذ.', author: 'إلهام', category: 'discipline' },
  { id: 60, text: 'كل عادة تمارسها هي تصويت لصالح الشخصية التي ترغب أن تصبح عليها.', author: 'جيمس كلير', category: 'discipline' },
  { id: 61, text: 'لا تبحث عن الحيل السريعة؛ لا يوجد بديل عن العمل اليومي المنضبط.', author: 'تطوير الذات', category: 'discipline' },
  { id: 62, text: 'الانضباط هو العملة الوحيدة التي تشتري بها مستقبلك المنشود.', author: 'روبرت كيوساكي', category: 'discipline' },
  { id: 63, text: 'من السهل أن تجد عذراً، لكن من الأنبل أن تجد طريقة للالتزام.', author: 'تحفيز', category: 'discipline' },
  { id: 64, text: 'الروتين هو صخرة النجاة وسط أمواج المشتتات العاتية.', author: 'تأمل سلوكي', category: 'discipline' },
  { id: 65, text: 'السيطرة على رغباتك الصغيرة هي الخطوة الأولى لقيادة حياتك الكبيرة.', author: 'سنيكا', category: 'discipline' },
  { id: 66, text: 'قوة الشخصية تتجلى في رفض المغريات اللحظية من أجل المجد الدائم.', author: 'فلسفة الرواقية', category: 'discipline' },
  { id: 67, text: 'التزامك اليومي هو رسالتك الصامتة للعالم بأنك تأخذ حياتك بجدية.', author: 'إلهام', category: 'discipline' },
  { id: 68, text: 'العادة تبدأ كخيط عنكبوت ضعيف، ومع الانضباط تصبح حبلاً فولاذياً.', author: 'مثل إسباني', category: 'discipline' },
  { id: 69, text: 'لا تؤجل؛ التسويف لص يسرق أعمارنا يوماً بعد يوم.', author: 'إدوارد يونغ', category: 'discipline' },
  { id: 70, text: 'انضباطك اليوم هو الذي يحميك من خيبات الغد.', author: 'حكمة', category: 'discipline' },

  // 3. الاستمرارية وعدم كسر السلسلة (Consistency & Streaks) - 35 quotes
  { id: 71, text: 'قاعدة الذهب في بناء العادات: لا تنقطع مرتين متتاليتين أبداً.', author: 'جيمس كلير', category: 'streak' },
  { id: 72, text: 'السلسلة القوية لا تُبنى بجهد يوم واحد، بل بحلقة واحدة تُضاف يومياً.', author: 'حكمة الستريك', category: 'streak' },
  { id: 73, text: 'الاستمرارية أهم من الكثافة؛ المشي يومياً أفضل من الركض مرة كل شهر.', author: 'علم التدريب', category: 'streak' },
  { id: 74, text: 'يوم سيء في الالتزام أفضل بأميال من يوم انقطاع كامل.', author: 'العادات الذرية', category: 'streak' },
  { id: 75, text: 'حتى لو كانت طاقتك 10% اليوم، أعطِ كل ما تملك من هذه الـ 10% ولا تقطع السلسلة.', author: 'تحفيز', category: 'streak' },
  { id: 76, text: 'النجاح ليس ضربة حظ مفاجئة، بل نتاج تكرار ممل لأفعال صحيحة.', author: 'تأمل', category: 'streak' },
  { id: 77, text: 'كل يوم تضيفه لسلسلتك يرفع حصانتك ضد التراجع والاستسلام.', author: 'سيكولوجيا العادات', category: 'streak' },
  { id: 78, text: 'لا تكسر السلسلة؛ دقيقة واحدة كافية لإبقاء الشعلة متقدة.', author: 'جيري سينفيلد', category: 'streak' },
  { id: 79, text: 'الماء المستمر ينحت أصلب الصخور لا بقوته بل بمداومته.', author: 'أوفيد', category: 'streak' },
  { id: 80, text: 'أحب الأعمال إلى الله أدومها وإن قل.', author: 'حديث شريف', category: 'streak' },
  { id: 81, text: 'الاستمرار في الأيام الصعبة هو ما يصنع الأبطال الحقيقيين.', author: 'تحفيز رياضي', category: 'streak' },
  { id: 82, text: 'عندما تشعر بالرغبة في التوقف، تذكر كم كان صعباً بناء سلسلتك حتى الآن.', author: 'إلهام', category: 'streak' },
  { id: 83, text: 'الوتيرة الهادئة المنتظمة تفوز دائماً في سباق الحياة.', author: 'حكمة السلحفاة', category: 'streak' },
  { id: 84, text: 'الأيام العادية هي التي تصنع النتائج غير العادية.', author: 'تطوير الذات', category: 'streak' },
  { id: 85, text: 'كل علامة صح تضيفها في تطبيقك هي لبنة متينة في قلعة شخصيتك.', author: 'قوة التتبع', category: 'streak' },
  { id: 86, text: 'لا تبهر العالم بيوم استثنائي؛ ادهشه بسنة كاملة من الالتزام اليومي.', author: 'فلسفة النجاح', category: 'streak' },
  { id: 87, text: 'العزم هو وقود الانطلاق، والاستمرارية هي وقود الوصول.', author: 'حكمة', category: 'streak' },
  { id: 88, text: 'حافظ على الستريك اليوم، وغداً ستشكر نفسك على هذا الإصرار.', author: 'تحفيز', category: 'streak' },
  { id: 89, text: 'الاستمرارية تقتل الشك، وتمنحك يقيناً بأنك قادر على المستحيل.', author: 'علم النفس', category: 'streak' },
  { id: 90, text: 'لا تفقد الزخم؛ الزخم في العادات هو أعظم قوة دافعة تملكها.', author: 'الفيزياء السلوكية', category: 'streak' },
  { id: 91, text: 'التكرار يروض المستحيل ويجعله عادة بديهية.', author: 'إلهام', category: 'streak' },
  { id: 92, text: 'إذا أردت أن تبهر نفسك، التزم بنفس العادة لمدة 100 يوم متتالية.', author: 'تحدي العادات', category: 'streak' },
  { id: 93, text: 'اليوم الذي تتكاسل فيه هو أهم يوم لتثبت فيه قوتك بالالتزام.', author: 'اختبار الإرادة', category: 'streak' },
  { id: 94, text: 'الأفعال الصغيرة المتكررة تغير كيمياء دماغك ومساراتك العصبية.', author: 'علم الأعصاب', category: 'streak' },
  { id: 95, text: 'لا تنتظر أن تصبح المزاجية مثالية؛ مارس عادتك وسيتعدل مزاجك.', author: 'حكمة عملية', category: 'streak' },
  { id: 96, text: 'سلسلتك هي سجل كرامتك، دافع عنها كما تدافع عن أثمن ما تملك.', author: 'تحفيز', category: 'streak' },
  { id: 97, text: 'قوة العادة تكمن في تراكمها الهادئ بعيداً عن صخب البدايات.', author: 'تأمل', category: 'streak' },
  { id: 98, text: 'كل يوم بدون انقطاع هو نصر جديد تسجله في كتاب حياتك.', author: 'إلهام', category: 'streak' },
  { id: 99, text: 'الاستمرارية تحول الهواية إلى احتراف، والجهد العادي إلى إعجاز.', author: 'تطوير الذات', category: 'streak' },
  { id: 100, text: 'التزم اليوم؛ فغداً سيكون أسهل بكثير إذا لم تنقطع اليوم.', author: 'العادات الذرية', category: 'streak' },
  { id: 101, text: 'السلسلة الخضراء في تقويمك هي أجمل لوحة فنية يمكنك رسمها.', author: 'فن العادات', category: 'streak' },
  { id: 102, text: 'كن كالنهر؛ يتدفق باستمرار ولا يوقفه أي عائق في طريقه.', author: 'تأمل', category: 'streak' },
  { id: 103, text: 'النجاح عادة وليس حدثاً؛ والمداومة هي لغته الوحيدة.', author: 'أرسطو', category: 'streak' },
  { id: 104, text: 'لا تستهن بيوم واحد من الالتزام، فهو الرابط بين ماضيك ومستقبلك.', author: 'حكمة', category: 'streak' },
  { id: 105, text: 'الستريك الطويل يبدأ بخطوة اليوم؛ لا تدعها تفوتك.', author: 'تحفيز', category: 'streak' },

  // 4. قوة الخطوات والتحسينات الصغيرة (Small Steps & 1% Better) - 30 quotes
  { id: 106, text: 'تحسن بنسبة 1% يومياً يعني أنك ستكون أفضل بـ 37 ضعفاً بنهاية العام.', author: 'معادلة العادات الذرية', category: 'small_steps' },
  { id: 107, text: 'الأشياء العظيمة لا تحدث فجأة، بل هي سلسلة من الأشياء الصغيرة مجتمعة.', author: 'فنسنت فان غوخ', category: 'small_steps' },
  { id: 108, text: 'صغّر العادة حتى يصبح من المستحيل أن تفشل في أدائها اليوم.', author: 'ستيفن غايز', category: 'small_steps' },
  { id: 109, text: 'قراءة صفحة واحدة أفضل من عدم القراءة، ودقيقة تمرين أفضل من لا شيء.', author: 'قاعدة العادات المصغرة', category: 'small_steps' },
  { id: 110, text: 'رحلة الألف ميل تبدأ بخطوة واحدة واثقة.', author: 'لاوتسو', category: 'small_steps' },
  { id: 111, text: 'قطرة فوق قطرة تنحت الحجر، وخطوة إثر خطوة تصنع المعجزات.', author: 'مثل عربي', category: 'small_steps' },
  { id: 112, text: 'لا تبحث عن قفزات عملاقة، ابحث عن تقدم مجهري وثابت لا يتوقف.', author: 'كايزن', category: 'small_steps' },
  { id: 113, text: 'الأثر التراكمي للقرارات اليومية الصغيرة هو ما يصنع مصيرك.', author: 'دارين هاردي', category: 'small_steps' },
  { id: 114, text: 'عندما تجعل العادة سهلة جداً، يزول حاجز المقاومة النفسية فوراً.', author: 'بي جي فوغ', category: 'small_steps' },
  { id: 115, text: 'قوة السحر التراكمي: القليل الدائم يغلب الكثير المنقطع دائماً.', author: 'حكمة', category: 'small_steps' },
  { id: 116, text: 'لا تستهن بالخطوة الصغيرة؛ فالجبل العظيم مجرد كومة من الحصى الصغير.', author: 'إلهام', category: 'small_steps' },
  { id: 117, text: 'ابدأ بعادتين دقيقتين فقط، وثبتهما قبل أن تفكر في التوسع.', author: 'جيمس كلير', category: 'small_steps' },
  { id: 118, text: 'التحسين الصغير كل يوم يراكم ثروة من الإنجاز بمرور الوقت.', author: 'وارن بافيت', category: 'small_steps' },
  { id: 119, text: 'أنت لست بحاجة إلى شجاعة خارقة؛ أنت بحاجة فقط للبدء بدقيقة واحدة.', author: 'علم النفس', category: 'small_steps' },
  { id: 120, text: 'البداية الصغيرة المتواضعة تحميك من خيبة التطلعات غير الواقعية.', author: 'العادات الذرية', category: 'small_steps' },
  { id: 121, text: 'ركز على الاتجاه الصحيح لا على السرعة؛ الخطوات الصغيرة في الاتجاه السليم تكفي.', author: 'حكمة صينية', category: 'small_steps' },
  { id: 122, text: 'إنجاز القليل اليوم يولد الرغبة في إنجاز المزيد غداً.', author: 'دوبامين الإنجاز', category: 'small_steps' },
  { id: 123, text: 'كل شجرة عملاقة كانت ذات يوم بذرة صغيرة استمرت في النمو.', author: 'تأمل في الطبيعة', category: 'small_steps' },
  { id: 124, text: 'لا تحتقر ما تقدمه لنفسك اليوم وإن كان يسيراً؛ فالنهر من قطرات.', author: 'حكمة أدبية', category: 'small_steps' },
  { id: 125, text: 'اجعل عادتك سهلة للغاية بحيث لا يمكنك أن تقول لها لا.', author: 'العادات الصغيرة', category: 'small_steps' },
  { id: 126, text: 'خمس دقائق من التركيز التام تهزم ساعات من التشتت والتردد.', author: 'إنتاجية', category: 'small_steps' },
  { id: 127, text: 'النجاح مركب كالفائدة التراكمية، يتضاعف دون أن تشعر حتى تذهلك النتائج.', author: 'ألبرت أينشتاين', category: 'small_steps' },
  { id: 128, text: 'حبة رمل تلو الأخرى تبني شواطئ المجد.', author: 'إلهام', category: 'small_steps' },
  { id: 129, text: 'تخلص من عقلية الكل أو لا شيء؛ الـ 1% أفضل بمليون مرة من الصفر.', author: 'تطوير العقل', category: 'small_steps' },
  { id: 130, text: 'كل سطر تقرأه وكل خطوة تخطوها تبعدك عن نسختك القديمة.', author: 'تنمية ذاتية', category: 'small_steps' },
  { id: 131, text: 'الصبر مع الخطوات الصغيرة هو سر كل إنجاز عبقري في التاريخ.', author: 'إسحاق نيوتن', category: 'small_steps' },
  { id: 132, text: 'ثبات الخطوة أهم من اتساعها؛ تقدم بهدوء وثقة.', author: 'حكمة عربية', category: 'small_steps' },
  { id: 133, text: 'العادة الصغيرة اليوم هي الهوية الراسخة غداً.', author: 'جيمس كلير', category: 'small_steps' },
  { id: 134, text: 'لا تنتظر أن تصبح عملاقاً لتبدأ؛ ابدأ صغيراً لتكبر مع الأيام.', author: 'تحفيز', category: 'small_steps' },
  { id: 135, text: 'الانتصارات الدقيقة اليومية تصنع هيبة النفس وثقتها المطلقة.', author: 'فلسفة القوة', category: 'small_steps' },

  // 5. الصمود أمام الرغبات والشهوات (Resilience & Cravings) - 30 quotes
  { id: 136, text: 'الرغبة الملحة كالموجة؛ اصمد لثلاث دقائق فقط وسترى كيف تنكسر وتتلاشى.', author: 'العلاج السلوكي المعرفي', category: 'resilience' },
  { id: 137, text: 'ألم الامتناع والمقاومة يدوم دقائق، لكن ألم الانتكاس والندم يدوم شهوراً.', author: 'حكمة الإقلاع', category: 'resilience' },
  { id: 138, text: 'كل مرة تقول فيها "لا" لشهوة عابرة، أنت تقول "نعم" لمستقبل مشرق.', author: 'تطوير الإرادة', category: 'resilience' },
  { id: 139, text: 'أنت لست رغباتك؛ أنت الوعي القوي الذي يراقب الرغبة ويختار مساره.', author: 'اليقظة الذهنية', category: 'resilience' },
  { id: 140, text: 'تذكر دائماً لماذا بدأت؛ لا تبع سنوات من الحلم بلحظة لذة رخيصة.', author: 'تحفيز الصمود', category: 'resilience' },
  { id: 141, text: 'حارب من أجل حريتك؛ الإدمان سجن والانضباط هو مفتاح بابك.', author: 'حكمة التحرر', category: 'resilience' },
  { id: 142, text: 'الرغبة كاذبة؛ تعدك بالراحة لكنها تتركك مع الفراغ والندم.', author: 'علم النفس', category: 'resilience' },
  { id: 143, text: 'تنفس بعمق، غيّر مكانك، اشرب ماءً؛ دقائق معدودة وتستعيد سيطرتك.', author: 'بروتوكول الصمود', category: 'resilience' },
  { id: 144, text: 'قوتك لا تظهر في أوقات الراحة، بل في اللحظة التي تقاوم فيها الإغراء.', author: 'فلسفة الرواقية', category: 'resilience' },
  { id: 145, text: 'كل إغراء تتغلب عليه اليوم يبني درعاً فولاذياً يحميك غداً.', author: 'إلهام', category: 'resilience' },
  { id: 146, text: 'أنت أقوى بكثير مما يخبرك به عقلك في لحظات الضعف المؤقتة.', author: 'تحفيز', category: 'resilience' },
  { id: 147, text: 'الانتصار على النفس هو أعظم انتصار عرفته البشرية.', author: 'أفلاطون', category: 'resilience' },
  { id: 148, text: 'لا تسمح لمشاعر مؤقتة أن تتخذ قرارات دائمة تدمر حياتك.', author: 'نضج سلوكي', category: 'resilience' },
  { id: 149, text: 'كل شهوة تهزمها ترفع قدرك في عين نفسك وفي ميزان الحقيقة.', author: 'تزكية النفس', category: 'resilience' },
  { id: 150, text: 'تذكر شعور الفخر الذي تشعر به عندما تخلد للنوم وأنت منتصر.', author: 'حكمة المساء', category: 'resilience' },
  { id: 151, text: 'الرغبة الملحة اختبار لصدقك مع نفسك؛ اجتز الاختبار بشرف.', author: 'تنمية ذاتية', category: 'resilience' },
  { id: 152, text: 'الصمود اليوم يعني أنك ستستيقظ غداً بطلاً حراً مرفوع الرأس.', author: 'إلهام', category: 'resilience' },
  { id: 153, text: 'لا تستسلم الآن، لقد قطعت شوطاً طويلاً لتصل إلى هنا.', author: 'تحفيز الإصرار', category: 'resilience' },
  { id: 154, text: 'الشهوة سحابة صيف؛ لا تجعلها تطفئ شمس إرادتك الدائمة.', author: 'تأمل شعري', category: 'resilience' },
  { id: 155, text: 'اختر الصعوبة التي تبنيك بدلاً من السهولة التي تهدمك.', author: 'فلسفة الصمود', category: 'resilience' },
  { id: 156, text: 'عندما تدعوك نفسك للانتكاس، قل لها: "أنا أستحق حياة أفضل من هذا".', author: 'حديث النفس الإيجابي', category: 'resilience' },
  { id: 157, text: 'التحكم في النفس ليس حرماناً، بل هو قمة السيادة والاكتفاء.', author: 'سنيكا', category: 'resilience' },
  { id: 158, text: 'المتعة تنتهي في ثوانٍ، أما الشرف والكرامة فيبقيا إلى الأبد.', author: 'علي بن أبي طالب', category: 'resilience' },
  { id: 159, text: 'كل صرخة "لا" تطلقها في وجه العادة السيئة هي ولادة جديدة لك.', author: 'تحفيز التغيير', category: 'resilience' },
  { id: 160, text: 'كن سيد رغباتك ولا تكن عبداً لما تشتهيه في لحظة غفلة.', author: 'حكمة خالدة', category: 'resilience' },
  { id: 161, text: 'أصعب المعارك هي التي تخوضها ضد نسختك السابقة؛ فانتصر عليها.', author: 'إلهام النصر', category: 'resilience' },
  { id: 162, text: 'إذا تجاوزت الدقائق العشر الأولى من الرغبة، فقد حسمت المعركة لصالحك.', author: 'قاعدة الدقائق العشر', category: 'resilience' },
  { id: 163, text: 'الإقلاع ليس حرماناً، بل هو استرداد لصحتك وصفاء ذهنك المسلوب.', author: 'علم الشفاء', category: 'resilience' },
  { id: 164, text: 'درعك الصامد اليوم يمنحك السلام الداخلي غداً.', author: 'تأمل', category: 'resilience' },
  { id: 165, text: 'لا أحد يندم على الصمود ومقاومة الرغبة؛ الندم يأتي فقط مع الاستسلام.', author: 'حقيقة نفسية', category: 'resilience' },

  // 6. النهوض بعد العثرات والتعافي (Comeback & Growth) - 25 quotes
  { id: 166, text: 'التعثر ليس نهاية الطريق، بل إشارة لتعديل المسار والمضي بحذر أكبر.', author: 'علم النفس التعاطفي', category: 'comeback' },
  { id: 167, text: 'ليس المهم كم مرة سقطت، بل المهم أن تقف في كل مرة أسرع مما سقطت.', author: 'كونفوشيوس', category: 'comeback' },
  { id: 168, text: 'يوم واحد سيء لا يمحو أشهراً من البناء؛ استجمع قوتك وابدأ من جديد فوراً.', author: 'العادات الذرية', category: 'comeback' },
  { id: 169, text: 'الندم المفرط فخ يعطلك؛ تعلم من العثرة واجعلها درساً لا قيداً.', author: 'العلاج المعرفي', category: 'comeback' },
  { id: 170, text: 'السقوط حادث طارئ، لكن البقاء ساقطاً هو قرار واختيار؛ فاختر النهوض.', author: 'تحفيز', category: 'comeback' },
  { id: 171, text: 'الصلابة النفسية تُقاس بمدى سرعتك في استعادة وتيرتك بعد الانقطاع.', author: 'سيكولوجيا المرونة', category: 'comeback' },
  { id: 172, text: 'كل بطل كان في يوم من الأيام مقاتلاً رفض الاستسلام بعد هزيمة.', author: 'روكي مارسيانو', category: 'comeback' },
  { id: 173, text: 'الماضي انتهى عند الدقيقة الماضية؛ هذه اللحظة تملك فيها بداية جديدة.', author: 'حكمة الحاضر', category: 'comeback' },
  { id: 174, text: 'كن رفيقاً بنفسك عند الزلل؛ القسوة تولد اليأس، والتعاطف يولد الإصرار.', author: 'كريستين نيف', category: 'comeback' },
  { id: 175, text: 'لا تجعل عثرة صغيرة تتحول إلى انهيار كامل؛ أصلح الخطوة التالية فقط.', author: 'قاعدة التصحيح الفوري', category: 'comeback' },
  { id: 176, text: 'الانقطاع جزء طبيعي من رحلة كل إنسان، الفرق الوحيد فيمن يعود أسرع.', author: 'إلهام', category: 'comeback' },
  { id: 177, text: 'الندوب التي تتركها العثرات هي أوسمة شرف تدل على أنك ما زلت تقاتل.', author: 'تأمل شعري', category: 'comeback' },
  { id: 178, text: 'نفض الغبار عن ثيابك والابتسام بعد الوقوع هو قمة الشجاعة.', author: 'نيلسون مانديلا', category: 'comeback' },
  { id: 179, text: 'ابدأ من حيث أنت، بما تملك، ولا تنتظر أول الشهر أو يوم الأحد القادم.', author: 'آرثر آش', category: 'comeback' },
  { id: 180, text: 'العودة بعد الانقطاع تحتاج شجاعة؛ فكن شجاعاً واضغط زر البداية الآن.', author: 'تحفيز العودة', category: 'comeback' },
  { id: 181, text: 'الذهب يُصقل بالنار، والإنسان القوي يُصقل بتجاوز العثرات والشدائد.', author: 'سنيكا', category: 'comeback' },
  { id: 182, text: 'لا تخجل من إعادة المحاولة؛ الخجل الحقيقي هو التوقف عن المحاولة.', author: 'حكمة عملية', category: 'comeback' },
  { id: 183, text: 'حتى أفضل الخوارزميات تتعثر وتصحح مسارها؛ أنت في رحلة تعلم مستمرة.', author: 'تفكير علمي', category: 'comeback' },
  { id: 184, text: 'الشمس تغرب كل ليلة لكنها تعود لتشرق بأبهى حلة كل صباح.', author: 'تأمل في الكون', category: 'comeback' },
  { id: 185, text: 'التعثر يعلمك نقطة ضعفك؛ حصّن هذه النقطة وواصل السير منتصراً.', author: 'استراتيجية النمو', category: 'comeback' },
  { id: 186, text: 'الحياة لا تطالبك بعدم السقوط، بل تطالبك بأن يكون نهوضك حتمياً.', author: 'تنمية ذاتية', category: 'comeback' },
  { id: 187, text: 'كل محاولة جديدة هي دليل حي على أن روحك ترفض الهزيمة.', author: 'إلهام الروح', category: 'comeback' },
  { id: 188, text: 'اعفُ عن نفسك عن تقصير الأمس، والتزم بعادة اليوم كأنك تبدأ لأول مرة.', author: 'سلام داخلي', category: 'comeback' },
  { id: 189, text: 'عظمة الإنسان ليست في عدم التعثر، بل في النهوض بعد كل كبوة.', author: 'رالف والدو إمرسون', category: 'comeback' },
  { id: 190, text: 'عد إلى سلسلتك الآن؛ تطبيقك ومستقبلك ينتظرانك بشوق.', author: 'نداء الاستئناف', category: 'comeback' },

  // 7. التركيز والهمة العالية (Deep Focus & Willpower) - 32 quotes
  { id: 191, text: 'حيثما يذهب تركيزك، تتدفق طاقتك، وتتجلى نتائجك في الواقع.', author: 'توني روبنز', category: 'focus' },
  { id: 192, text: 'التركيز هو القدرة على قول "لا" لمئات الأشياء الجيدة من أجل الشيء العظيم.', author: 'ستيف جوبز', category: 'focus' },
  { id: 193, text: 'عالم اليوم مليء بالضجيج؛ من يملك هدوء التركيز يملك مفاتيح النجاح.', author: 'كال نيوبورت', category: 'focus' },
  { id: 194, text: 'المشتتات هي أعداء العادات؛ نظف بيئتك وسينطلق تركيزك كالسهم.', author: 'العادات الذرية', category: 'focus' },
  { id: 195, text: 'عشرون دقيقة من التركيز العميق تفوق ساعات من التظاهر بالعمل.', author: 'تقنية بومودورو', category: 'focus' },
  { id: 196, text: 'أشعل شعلة انتباهك واحمِها من رياح الإشعارات والمغريات التافهة.', author: 'فن التركيز', category: 'focus' },
  { id: 197, text: 'العين على الهدف، والعقل حاضر في الخطوة الحالية؛ هذا هو سر الإتقان.', author: 'التركيز الكامل', category: 'focus' },
  { id: 198, text: 'لا تفعل أمرين في وقت واحد؛ أعطِ عادتك كامل روحك وعقلك لتترسخ.', author: 'علم الانتباه', category: 'focus' },
  { id: 199, text: 'الوضوح يولد السرعة، والتركيز يولد القوة المطلقة.', author: 'حكمة القيادة', category: 'focus' },
  { id: 200, text: 'حين تنغمس في جلسة التركيز، يتوقف الزمن وتبدأ المعجزات في الحدوث.', author: 'حالة التدفق (Flow)', category: 'focus' },
  { id: 201, text: 'أنت لست آلة، بل طاقة حية؛ وجه طاقتك لما يصنع فارقاً حقيقياً في حياتك.', author: 'إلهام', category: 'focus' },
  { id: 202, text: 'قوة العقل كأشعة الليزر؛ عندما تتركز في نقطة واحدة تصبح قادرة على قطع الفولاذ.', author: 'تطوير القدرات', category: 'focus' },
  { id: 203, text: 'ابتعد عن الهاتف، أغلق النوافذ الإضافية، وامنح عادتك حقها من الاحترام.', author: 'حكمة العصر الرقمي', category: 'focus' },
  { id: 204, text: 'لا تبدد طاقتك في القلق على النتائج؛ ركز في إتقان الفعل الحاضر.', author: 'فلسفة الزن', category: 'focus' },
  { id: 205, text: 'الصمت والتركيز هما البيئة التي تنمو فيها العبقرية وتزدهر.', author: 'توماس إديسون', category: 'focus' },
  { id: 206, text: 'كل جلسة تركيز تنهيها هي انتصار على ثقافة التشتت السطحي.', author: 'العمل العميق', category: 'focus' },
  { id: 207, text: 'اجعل مؤقت التركيز حليفك؛ عندما يدق العداد كن كالمحارب في ساحته.', author: 'انضباط الجلسة', category: 'focus' },
  { id: 208, text: 'الشخص الذي يركز على مساره لا ينشغل بمسارات الآخرين.', author: 'حكمة السباق', category: 'focus' },
  { id: 209, text: 'التركيز يجلب السكينة؛ عندما يعرف عقلك ما يفعله بدقة يزول القلق.', author: 'علم النفس العصبي', category: 'focus' },
  { id: 210, text: 'حدد عادة واحدة الآن، واجعلها أولويتك المطلقة حتى تفرغ منها.', author: 'قاعدة الشيء الواحد', category: 'focus' },
  { id: 211, text: 'همتك العالية هي التي تحول الروتين العادي إلى شغف وإنجاز ساحر.', author: 'تحفيز الهمم', category: 'focus' },
  { id: 212, text: 'احمِ وقتك وعاداتك كما تحمي خزينتك المالية؛ فالوقت هو الحياة.', author: 'ستيفن كوفي', category: 'focus' },
  { id: 213, text: 'الانغماس التام في الحاضر هو المفتاح السحري لإتقان أي مهارة جديدة.', author: 'ميهالي تشيكسينتميهالي', category: 'focus' },
  { id: 214, text: 'من لم يركز في قليل عاداته تشتت في كثير أهدافه.', author: 'حكمة عربية', category: 'focus' },
  { id: 215, text: 'كن حاضراً بكل حواسك مع عادتك الآن؛ هذه هي اللحظة الوحيدة التي تملكها.', author: 'اليقظة التامة', category: 'focus' },
  { id: 216, text: 'العمق يهزم السطحية؛ اجعل جلسات تركيزك مقدسة ولا تسمح لأحد بقطعها.', author: 'العمل العميق', category: 'focus' },
  { id: 217, text: 'ركز على ما يمكنك التحكم فيه ودع ما سواه يمر في سلام.', author: 'ماركوس أوريليوس', category: 'focus' },
  { id: 218, text: 'قوة العزيمة تذلل أصعب المهام عندما تجتمع مع التركيز الصادق.', author: 'حكمة', category: 'focus' },
  { id: 219, text: 'العادة التي تُبنى بتركيز عميق تدوم معك طوال العمر كالغريزة.', author: 'تثبيت العادات', category: 'focus' },
  { id: 220, text: 'أنت تصنع حاضرك الآن بتركيزك؛ والمستقبل سيتكفل بنفسه.', author: 'إلهام الختام', category: 'focus' },
  { id: 221, text: 'لا تستعجل الحصاد؛ ركز في رعاية البذرة وسيهديك الله أطيب الثمار.', author: 'حكمة فلاح', category: 'focus' },
  { id: 222, text: 'عاداتك هي نبض حياتك؛ حافظ على وتيرة النبض تضمن حياة مزدهرة.', author: 'الخاتمة الملهمة', category: 'focus' },
];

/**
 * Deterministically returns a quote for today based on the day of the year.
 * This guarantees all users see a consistent "Quote of the Day" on any given date.
 */
export function getDailyQuote(dateStr?: string): MotivationalQuote {
  const date = dateStr ? new Date(dateStr) : new Date();
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

/**
 * Returns a truly random quote from the entire collection
 */
export function getRandomQuote(): MotivationalQuote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}

/**
 * Returns a quote suitable for morning notifications and starting the day
 */
export function getMorningQuote(): MotivationalQuote {
  const morningQuotes = MOTIVATIONAL_QUOTES.filter((q) => q.category === 'morning' || q.category === 'discipline');
  const index = Math.floor(Math.random() * morningQuotes.length);
  return morningQuotes[index] || MOTIVATIONAL_QUOTES[0];
}

/**
 * Returns a quote for inactivity / dormancy reminders and streak protection
 */
export function getInactivityQuote(): MotivationalQuote {
  const comebackQuotes = MOTIVATIONAL_QUOTES.filter((q) => q.category === 'streak' || q.category === 'comeback');
  const index = Math.floor(Math.random() * comebackQuotes.length);
  return comebackQuotes[index] || MOTIVATIONAL_QUOTES[70];
}

/**
 * Returns a quote for streaks or milestones
 */
export function getStreakQuote(): MotivationalQuote {
  const streakQuotes = MOTIVATIONAL_QUOTES.filter((q) => q.category === 'streak' || q.category === 'small_steps');
  const index = Math.floor(Math.random() * streakQuotes.length);
  return streakQuotes[index] || MOTIVATIONAL_QUOTES[105];
}

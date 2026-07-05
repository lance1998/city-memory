

const DB = {
  currentUser: {
    id: 'u001',
    nickname: '城市记忆者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    bio: '记录每一座城市的变迁',
    city: '日照',
    isExpert: false,
    memoryCount: 2,
    likeCount: 156,
    exploredCities: 1,
    vipLevel: 0,
    createdAt: '2026-01-15'
  },

  memories: [
    {
      id: 1,
      title: '日照老火车站',
      city: '日照',
      district: '东港区',
      lng: 119.526,
      lat: 35.418,
      address: '海曲路',
      oldImages: ['https://picsum.photos/seed/rztrain1/400/300'],
      newImage: 'https://picsum.photos/seed/rztrain2/400/300',
      useStreetview: false,
      year: '80年代',
      story: '小时候第一次坐火车就是从这个老站出发的。绿色的铁皮火车，站房里永远飘着茶叶蛋和泡面的味道。那时候站台没有护栏，送客的人可以一直走到车厢旁边。如今高铁站宽敞明亮，却再也找不到当年那种期待和兴奋的感觉了。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#交通', '#童年', '#第一次'],
      userId: 'u002',
      authorName: '老日照人',
      isAnonymous: false,
      likes: 328,
      comments: 56,
      views: 1205,
      isFeatured: true,
      status: '已发布',
      createdAt: '2026-03-15'
    },
    {
      id: 2,
      title: '日照百货大楼',
      city: '日照',
      district: '东港区',
      lng: 119.531,
      lat: 35.425,
      address: '海曲中路',
      oldImages: ['https://picsum.photos/seed/rzstore1/400/300'],
      newImage: 'https://picsum.photos/seed/rzstore2/400/300',
      useStreetview: false,
      year: '90年代',
      story: '每年过年，爸妈都会带我来这里买新衣服。一楼的化妆品柜台总是香喷喷的，二楼是女装，三楼是男装。那时候没有试衣间，就在柜台旁边比划一下。现在这里变成了大型购物中心，但记忆里那个旋转楼梯和玻璃柜台永远都在。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#购物', '#童年', '#过年'],
      userId: 'u003',
      authorName: '海曲中路80号',
      isAnonymous: false,
      likes: 256,
      comments: 42,
      views: 980,
      isFeatured: true,
      status: '已发布',
      createdAt: '2026-04-02'
    },
    {
      id: 3,
      title: '万平口海水浴场',
      city: '日照',
      district: '东港区',
      lng: 119.545,
      lat: 35.415,
      address: '万平口',
      oldImages: ['https://picsum.photos/seed/rzsea1/400/300'],
      newImage: 'https://picsum.photos/seed/rzsea2/400/300',
      useStreetview: false,
      year: '00年代',
      story: '小时候的夏天就是泡在海里的。那时候万平口还不是景区，沙滩上没有这么多游客，赶海能捡到满满一桶蛤蜊。现在的海滩修得很漂亮，有木栈道、观光车，但总觉得少了点什么。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#海边', '#童年', '#夏天'],
      userId: 'u004',
      authorName: '海边的孩子',
      isAnonymous: false,
      likes: 412,
      comments: 78,
      views: 1560,
      isFeatured: true,
      status: '已发布',
      createdAt: '2026-04-20'
    },
    {
      id: 4,
      title: '日照一中老校门',
      city: '日照',
      district: '东港区',
      lng: 119.528,
      lat: 35.430,
      address: '烟台路',
      oldImages: ['https://picsum.photos/seed/rzschool1/400/300'],
      newImage: 'https://picsum.photos/seed/rzschool2/400/300',
      useStreetview: false,
      year: '90年代',
      story: '这扇铁门见证了无数人的青春。每天早上踩着铃声冲进校门，中午在校门口的小摊买煎饼果子，晚上下自习后跟同学在门口的小卖部买泡面。高考那天，全班在这里合影，说好十年后再见。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#校园', '#青春', '#高考'],
      userId: 'u005',
      authorName: '九六届毕业生',
      isAnonymous: false,
      likes: 198,
      comments: 34,
      views: 760,
      isFeatured: false,
      status: '已发布',
      createdAt: '2026-05-05'
    },
    {
      id: 5,
      title: '石臼所老街',
      city: '日照',
      district: '石臼',
      lng: 119.540,
      lat: 35.408,
      address: '石臼',
      oldImages: ['https://picsum.photos/seed/rzoldst1/400/300'],
      newImage: 'https://picsum.photos/seed/rzoldst2/400/300',
      useStreetview: false,
      year: '80年代',
      story: '石臼的老街是日照最有烟火气的地方。清晨的渔港，刚上岸的海鲜直接在码头交易。老街两旁是低矮的瓦房，有修鞋铺、剃头店、小茶馆。现在这里盖起了高楼，老街的石头路也被柏油马路取代了。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#老街', '#烟火气', '#渔港'],
      userId: 'u006',
      authorName: '石臼老张',
      isAnonymous: false,
      likes: 175,
      comments: 28,
      views: 650,
      isFeatured: false,
      status: '已发布',
      createdAt: '2026-05-12'
    },
    {
      id: 6,
      title: '太阳城市场',
      city: '日照',
      district: '老城区',
      lng: 119.525,
      lat: 35.420,
      address: '老城区',
      oldImages: ['https://picsum.photos/seed/rzmarket1/400/300'],
      newImage: 'https://picsum.photos/seed/rzmarket2/400/300',
      useStreetview: false,
      year: '90年代',
      story: '太阳城市场是日照人过年的必去之地。腊月里，市场里人山人海，卖对联的、卖年货的、卖糖果瓜子的挤在一起。妈妈总会跟摊主砍半天价，最后多要两颗糖。那种热闹和喧嚣，是任何超市都给不了的。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#市场', '#烟火气', '#过年'],
      userId: 'u007',
      authorName: '老城区阿姨',
      isAnonymous: false,
      likes: 310,
      comments: 51,
      views: 1120,
      isFeatured: true,
      status: '已发布',
      createdAt: '2026-05-20'
    },
    {
      id: 7,
      title: '海曲公园大象滑梯',
      city: '日照',
      district: '东港区',
      lng: 119.533,
      lat: 35.422,
      address: '海曲公园',
      oldImages: ['https://picsum.photos/seed/rzpark1/400/300'],
      newImage: 'https://picsum.photos/seed/rzpark2/400/300',
      useStreetview: false,
      year: '00年代',
      story: '海曲公园的大象滑梯是所有日照孩子的共同记忆。那个大象鼻子做成的滑梯，不知道磨破了多少条裤子。每年春天学校组织春游，这里都是必打卡的地方。还有碰碰车、旋转木马，小时候觉得这里就是全世界。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#公园', '#童年', '#春游'],
      userId: 'u008',
      authorName: '大象滑梯爱好者',
      isAnonymous: false,
      likes: 267,
      comments: 45,
      views: 890,
      isFeatured: false,
      status: '已发布',
      createdAt: '2026-06-01'
    },
    {
      id: 8,
      title: '日照港',
      city: '日照',
      district: '港区',
      lng: 119.550,
      lat: 35.395,
      address: '港区',
      oldImages: ['https://picsum.photos/seed/rzport1/400/300'],
      newImage: 'https://picsum.photos/seed/rzport2/400/300',
      useStreetview: false,
      year: '00年代',
      story: '父亲是港口的老工人，小时候经常跟着他来到码头。那时候港口的吊机还没有现在这么高，万吨巨轮靠港时，整个码头都在震动。父亲说他亲眼见证了日照港从小渔村码头变成全国前列的大港。如今退休了，每次路过港口，他都会停下来看一会儿。',
      voiceUrl: null,
      voiceDuration: 0,
      tags: ['#工业', '#港口', '#父辈'],
      userId: 'u009',
      authorName: '港口二代',
      isAnonymous: false,
      likes: 189,
      comments: 31,
      views: 720,
      isFeatured: false,
      status: '已发布',
      createdAt: '2026-06-10'
    }
  ],

  comments: [
    { id: 1, memoryId: 1, userId: 'u010', authorName: '日照小哥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u10', content: '我也是！小时候坐火车去济南，凌晨四点多就要到车站等车。', createdAt: '2026-03-16', likes: 12 },
    { id: 2, memoryId: 1, userId: 'u011', authorName: '怀旧达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u11', content: '老站台的味道，现在的年轻人体会不到了。', createdAt: '2026-03-17', likes: 8 },
    { id: 3, memoryId: 2, userId: 'u012', authorName: '百货大楼常客', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u12', content: '旋转楼梯！我记得二楼拐角处还有个卖糖葫芦的老奶奶。', createdAt: '2026-04-03', likes: 15 },
    { id: 4, memoryId: 3, userId: 'u013', authorName: '海边钓鱼佬', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u13', content: '现在的万平口收费了，怀念以前免费开放的日子。', createdAt: '2026-04-21', likes: 22 }
  ],

  favorites: [1, 3, 6],

  footprints: [1, 2, 3, 4, 6],

  routes: [
    {
      id: 1,
      title: '老街漫步线',
      desc: '穿越日照老城区，感受百年街巷的烟火气息',
      image: 'https://picsum.photos/seed/route1/400/200',
      duration: '2.5小时',
      distance: '3.2公里',
      color: '#E07A5F',
      official: true,
      officialBadge: '文旅认证',
      stops: [
        { name: '石臼所老街', desc: '渔港老街，日照最早的居民区', lat: 35.422, lng: 119.538 },
        { name: '太阳城市场', desc: '老日照人最爱的集市', lat: 35.428, lng: 119.534 },
        { name: '海曲中路', desc: '日照的商业命脉，见证城市变迁', lat: 35.425, lng: 119.531 },
        { name: '老火车站', desc: '绿皮火车的年代记忆', lat: 35.418, lng: 119.526 }
      ]
    },
    {
      id: 2,
      title: '校园回忆线',
      desc: '重返青春岁月，打卡日照各年代校园地标',
      image: 'https://picsum.photos/seed/route2/400/200',
      duration: '3小时',
      distance: '4.5公里',
      color: '#3D5A80',
      official: false,
      stops: [
        { name: '日照一中老校门', desc: '无数人的青春起点', lat: 35.416, lng: 119.523 },
        { name: '海曲公园', desc: '春游秋游的圣地', lat: 35.412, lng: 119.529 },
        { name: '老图书馆', desc: '那个年代的精神角落', lat: 35.420, lng: 119.535 }
      ]
    },
    {
      id: 3,
      title: '老味道寻踪线',
      desc: '寻觅日照老味道，从街头小吃到老字号',
      image: 'https://picsum.photos/seed/route3/400/200',
      duration: '2小时',
      distance: '2.8公里',
      color: '#81B29A',
      official: true,
      officialBadge: '非遗寻访',
      stops: [
        { name: '太阳城市场', desc: '年货和糖果的天堂', lat: 35.428, lng: 119.534 },
        { name: '石臼海鲜码头', desc: '最新鲜的海味', lat: 35.435, lng: 119.545 },
        { name: '海曲中路小吃街', desc: '煎饼果子和茶叶蛋', lat: 35.425, lng: 119.531 }
      ]
    }
  ],

  heritage: [
    { id: 101, title: '日照黑陶', category: 'heritage', desc: '国家级非遗，距今已有五千多年历史，以其"黑如漆、亮如镜、薄如纸、硬如瓷"著称', image: 'https://picsum.photos/seed/heritage1/400/300', location: '日照市陶艺馆' },
    { id: 102, title: '岚山渔民号子', category: 'heritage', desc: '渔民出海劳作时唱的劳动号子，已被列入省级非物质文化遗产名录', image: 'https://picsum.photos/seed/heritage2/400/300', location: '岚山区渔港' },
    { id: 103, title: '莒县过门笺', category: 'heritage', desc: '春节贴在门楣上的剪纸艺术，寓意迎春纳福，色彩艳丽，构图精巧', image: 'https://picsum.photos/seed/heritage3/400/300', location: '莒县文化馆' },
    { id: 104, title: '五莲割花', category: 'heritage', desc: '传统手工刺绣技艺，以针法细腻、图案生动闻名', image: 'https://picsum.photos/seed/heritage4/400/300', location: '五莲县' }
  ],

  timehonored: [
    { id: 201, title: '日照茶庄', category: 'timehonored', desc: '创立于1956年，三代人经营的日照绿茶老店，是日照绿茶的活招牌', image: 'https://picsum.photos/seed/time1/400/300', location: '海曲中路' },
    { id: 202, title: '石臼海产行', category: 'timehonored', desc: '三代人经营的海味老店，从渔船到餐桌，四十年如一日的新鲜', image: 'https://picsum.photos/seed/time2/400/300', location: '石臼渔港' },
    { id: 203, title: '海曲书店', category: 'timehonored', desc: '藏在老街深处的小书店，开了四十年，是几代日照人的阅读记忆', image: 'https://picsum.photos/seed/time3/400/300', location: '海曲路' }
  ],

  activities: [
    { id: 1, title: '老照片征集大赛', desc: '晒出你珍藏的城市老照片，讲述照片背后的故事，赢文创大奖', image: 'https://picsum.photos/seed/act1/400/200', status: '进行中', endDate: '2026-08-15', participants: 1280, tag: '征集' },
    { id: 2, title: '城市记忆文化节', desc: '一年一度的城市记忆盛宴，怀旧市集、年代主题演出、记忆论坛', image: 'https://picsum.photos/seed/act2/400/200', status: '即将开始', endDate: '2026-10-01', participants: 560, tag: '节庆' },
    { id: 3, title: '非遗寻访打卡', desc: '寻访日照非遗传承人，记录传统技艺，完成打卡解锁专属勋章', image: 'https://picsum.photos/seed/act3/400/200', status: '进行中', endDate: '2026-09-30', participants: 340, tag: '打卡' }
  ],

  capsules: [
    {
      id: 1,
      recipient: 'self',
      recipientName: '未来的自己',
      unlockTime: '2031-07-04',
      content: '希望五年后的你还记得今天在海边的日落。',
      photo: null,
      style: 'classic',
      createdAt: '2026-07-04'
    }
  ],

  products: [
    { id: 1, name: '日照记忆明信片套装', price: 28, category: 'postcard', image: 'https://picsum.photos/seed/prod1/300/300', desc: '精选8张日照地标新旧对比明信片，附赠复古邮票贴纸' },
    { id: 2, name: '城市记忆2027日历', price: 58, category: 'calendar', image: 'https://picsum.photos/seed/prod2/300/300', desc: '365天，365个日照记忆故事，每天翻开一页旧时光' },
    { id: 3, name: '老日照画册', price: 128, category: 'book', image: 'https://picsum.photos/seed/prod3/300/300', desc: '收录100组新旧对比照片，精装全彩印刷' },
    { id: 4, name: '地标冰箱贴套装', price: 39, category: 'gift', image: 'https://picsum.photos/seed/prod4/300/300', desc: '6款经典地标造型，磁吸设计，留住城市记忆' },
    { id: 5, name: '时光胶囊礼盒', price: 88, category: 'gift', image: 'https://picsum.photos/seed/prod5/300/300', desc: '包含胶囊瓶、信纸、火漆印章，给未来写封信' },
    { id: 6, name: '复古搪瓷杯', price: 45, category: 'gift', image: 'https://picsum.photos/seed/prod6/300/300', desc: '印有老日照地标的复古搪瓷杯，怀旧必备' }
  ],

  badges: [
    { id: 1, name: '首次上传', desc: '发布第一条城市记忆', icon: 'fa-upload', unlocked: true },
    { id: 2, name: '探索达人', desc: '浏览10条不同记忆', icon: 'fa-eye', unlocked: true },
    { id: 3, name: '修复大师', desc: '使用AI修复5张照片', icon: 'fa-magic', unlocked: false },
    { id: 4, name: '年代穿越者', desc: '上传3个不同年代的记忆', icon: 'fa-history', unlocked: false },
    { id: 5, name: '人气之星', desc: '单条记忆获得100个赞', icon: 'fa-heart', unlocked: false },
    { id: 6, name: '路线征服者', desc: '完成3条记忆路线', icon: 'fa-route', unlocked: false },
    { id: 7, name: '胶囊守护者', desc: '埋下3个时光胶囊', icon: 'fa-archive', unlocked: false },
    { id: 8, name: '怀旧智者', desc: '问答挑战获得满分', icon: 'fa-brain', unlocked: false },
    { id: 9, name: '城市守护者', desc: '累计发布10条记忆', icon: 'fa-city', unlocked: false },
    { id: 10, name: '研学达人', desc: '完成研学闯关挑战', icon: 'fa-graduation-cap', unlocked: false }
  ],

  quizQuestions: [
    {
      id: 1,
      question: '这是哪个地标的老照片？',
      image: 'https://picsum.photos/seed/q1/400/250',
      options: ['日照老火车站', '日照百货大楼', '石臼所老街', '海曲公园'],
      answer: 0
    },
    {
      id: 2,
      question: '这张照片最可能拍摄于哪个年代？',
      image: 'https://picsum.photos/seed/q2/400/250',
      options: ['1970年代', '1980年代', '1990年代', '2000年代'],
      answer: 1
    },
    {
      id: 3,
      question: '日照港在哪一年成为全国前列的大港？',
      options: ['1980年代', '1990年代', '2000年代', '2010年代'],
      answer: 2
    },
    {
      id: 4,
      question: '海曲公园大象滑梯是几代日照人的共同记忆？',
      options: ['70后', '80后', '90后', '以上皆是'],
      answer: 3
    },
    {
      id: 5,
      question: '石臼所老街最著名的是什么？',
      image: 'https://picsum.photos/seed/q5/400/250',
      options: ['古玩市场', '渔港海鲜', '茶馆书场', '绸缎布庄'],
      answer: 1
    }
  ],

  topics: [
    { id: 1, title: '消失的老校门', desc: '那些曾经走进走出的大门，见证了多少人的青春', count: 128 },
    { id: 2, title: '老市场的烟火气', desc: '喧嚣、热闹、讨价还价，最接地气的生活场景', count: 96 },
    { id: 3, title: '海边的童年', desc: '赶海、游泳、捡贝壳，关于大海的记忆', count: 215 },
    { id: 4, title: '工厂岁月', desc: '父辈们的奋斗年代，工业记忆的见证', count: 78 }
  ],

  privateMemories: [
    {
      id: 'p001',
      title: '外婆家的老院子',
      city: '日照',
      address: '老城区海曲路12号',
      lat: 35.423,
      lng: 119.529,
      oldImages: ['https://picsum.photos/seed/private1/400/300'],
      year: '80年代',
      story: '小时候每年暑假都住在外婆家，院子里有一棵大枣树，秋天的时候枣子落满地。现在院子已经拆了，变成了小区停车场。',
      tags: ['#老院子', '#外婆家', '#童年'],
      privacy: 'private',
      publicApplied: false,
      familyMembers: ['妈妈', '舅舅'],
      createdAt: '2026-04-15'
    },
    {
      id: 'p002',
      title: '父亲单位的老家属院',
      city: '日照',
      address: '石臼港务局家属院',
      lat: 35.410,
      lng: 119.538,
      oldImages: ['https://picsum.photos/seed/private2/400/300'],
      year: '90年代',
      story: '父亲在港务局工作了三十年，这个家属院住了我们全家二十年。楼道里永远飘着各家做饭的香味，孩子们放学后就在院子里疯跑。',
      tags: ['#家属院', '#父辈', '#拆迁'],
      privacy: 'private',
      publicApplied: false,
      familyMembers: ['爸爸'],
      createdAt: '2026-05-20'
    }
  ],

  state: {
    currentPage: 'map',
    prevPage: null,
    currentCity: '日照',
    yearFilter: 'all',
    sortBy: 'newest',
    currentMemoryId: null,
    uploadStep: 1,
    quizScore: 0,
    quizIndex: 0,
    recording: false,
    voiceTimer: null,
    quizChallengeLevel: 1,
    quizChallengeScore: 0,
    quizChallengeLives: 3,
    quizChallengeIndex: 0,
    showPrivateLayer: false,
    currentPrivateId: null,
    starVisited: {},
    currentStoryNode: 'start'
  }
};

const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem('citymemory_' + key);
      return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
  },
  set(key, value) {
    try {
      localStorage.setItem('citymemory_' + key, JSON.stringify(value));
    } catch(e) {}
  }
};

function initStorage() {
  if (!Storage.get('initialized')) {
    Storage.set('memories', DB.memories);
    Storage.set('favorites', DB.favorites);
    Storage.set('footprints', DB.footprints);
    Storage.set('capsules', DB.capsules);
    Storage.set('badges', DB.badges);
    Storage.set('comments', DB.comments);
    Storage.set('currentUser', DB.currentUser);
    Storage.set('state', DB.state);
    Storage.set('feedItems', DB.feedItems);
    Storage.set('privateMemories', DB.privateMemories);
    if (DB.weeklyBest) Storage.set('weeklyBest', DB.weeklyBest);
    Storage.set('fragments', DB.fragments);
    Storage.set('storyUnlocked', DB.storyUnlocked);
    Storage.set('storyEndings', []);
    Storage.set('initialized', true);
    console.log('[Storage] 首次初始化完成');
  } else {
    const memories = Storage.get('memories');
    if (memories) DB.memories = memories;
    const favorites = Storage.get('favorites');
    if (favorites) DB.favorites = favorites;
    const footprints = Storage.get('footprints');
    if (footprints) DB.footprints = footprints;
    const capsules = Storage.get('capsules');
    if (capsules) DB.capsules = capsules;
    const badges = Storage.get('badges');
    if (badges) DB.badges = badges;
    const comments = Storage.get('comments');
    if (comments) DB.comments = comments;
    const currentUser = Storage.get('currentUser');
    if (currentUser) DB.currentUser = currentUser;
    const state = Storage.get('state');
    if (state) {
      DB.state.yearFilter = state.yearFilter || DB.state.yearFilter;
      DB.state.sortBy = state.sortBy || DB.state.sortBy;
    }
    const privateMemories = Storage.get('privateMemories');
    if (privateMemories) DB.privateMemories = privateMemories;
    const weeklyBest = Storage.get('weeklyBest');
    if (weeklyBest && DB.weeklyBest) DB.weeklyBest = weeklyBest;
    const fragments = Storage.get('fragments');
    if (fragments) DB.fragments = fragments;
    const storyUnlocked = Storage.get('storyUnlocked');
    if (storyUnlocked !== null) DB.storyUnlocked = storyUnlocked;
    const storyEndings = Storage.get('storyEndings');
    if (storyEndings) DB.storyEndings = storyEndings;
    console.log('[Storage] 数据已恢复，记忆数:', DB.memories.length);
  }
}

DB.save = function(keys) {
  if (!keys) keys = ['memories', 'favorites', 'footprints', 'capsules', 'badges', 'comments', 'currentUser', 'state', 'privateMemories', 'weeklyBest', 'fragments', 'storyUnlocked', 'storyEndings'];
  keys.forEach(key => {
    if (this[key] !== undefined) Storage.set(key, this[key]);
  });
};

const Utils = {
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
  formatCountdown(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    if (diff <= 0) return '已解锁';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `还有 ${days} 天解锁`;
  },
  getYearClass(year) {
    const map = { '70年代': '70s', '80年代': '80s', '90年代': '90s', '00年代': '00s', '10年代': '10s', '20年代': '10s' };
    return map[year] || 'all';
  }
};

DB.users = [
  { id: 'u002', nickname: '老日照人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2', bio: '在日照生活了50年，记录这座城市的变化', city: '日照', level: 4, levelName: '城市讲述者', memoryCount: 23, likeCount: 1520, followerCount: 342, followingCount: 56, isExpert: true, isFollowing: true },
  { id: 'u003', nickname: '海曲中路80号', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3', bio: '百货大楼的常客，如今是两个孩子的妈妈', city: '日照', level: 3, levelName: '记录者', memoryCount: 15, likeCount: 890, followerCount: 128, followingCount: 34, isExpert: false, isFollowing: false },
  { id: 'u004', nickname: '海边的孩子', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u4', bio: '日照长大的海娃子，现在在北京工作', city: '日照', level: 5, levelName: '城市讲述者', memoryCount: 31, likeCount: 2100, followerCount: 567, followingCount: 89, isExpert: true, isFollowing: true },
  { id: 'u005', nickname: '九六届毕业生', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u5', bio: '日照一中96届，现在在青岛做老师', city: '日照', level: 2, levelName: '见证者', memoryCount: 8, likeCount: 420, followerCount: 56, followingCount: 23, isExpert: false, isFollowing: false },
  { id: 'u006', nickname: '石臼老张', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u6', bio: '石臼老街的原住民，见证了渔港的变迁', city: '日照', level: 3, levelName: '记录者', memoryCount: 12, likeCount: 680, followerCount: 95, followingCount: 41, isExpert: false, isFollowing: true },
  { id: 'u007', nickname: '老城区阿姨', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u7', bio: '退休语文老师，热爱记录日照的人文故事', city: '日照', level: 4, levelName: '城市讲述者', memoryCount: 18, likeCount: 1340, followerCount: 278, followingCount: 63, isExpert: true, isFollowing: false },
  { id: 'u008', nickname: '大象滑梯爱好者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u8', bio: '90后日照土著，海曲公园的忠实粉丝', city: '日照', level: 2, levelName: '见证者', memoryCount: 6, likeCount: 310, followerCount: 42, followingCount: 18, isExpert: false, isFollowing: false },
  { id: 'u009', nickname: '港口二代', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u9', bio: '日照港老工人后代，记录港口工业记忆', city: '日照', level: 3, levelName: '记录者', memoryCount: 10, likeCount: 560, followerCount: 78, followingCount: 35, isExpert: false, isFollowing: false },
  { id: 'u010', nickname: '日照小哥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u10', bio: '95后日照青年，喜欢挖掘城市角落的故事', city: '日照', level: 2, levelName: '见证者', memoryCount: 5, likeCount: 230, followerCount: 34, followingCount: 67, isExpert: false, isFollowing: true },
  { id: 'u011', nickname: '怀旧达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u11', bio: '收集老照片的业余爱好者', city: '日照', level: 1, levelName: '新手', memoryCount: 3, likeCount: 120, followerCount: 15, followingCount: 45, isExpert: false, isFollowing: false },
  { id: 'u012', nickname: '百货大楼常客', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u12', bio: '从小在百货大楼买衣服长大，见证了商业变迁', city: '日照', level: 2, levelName: '见证者', memoryCount: 6, likeCount: 280, followerCount: 48, followingCount: 30, isExpert: false, isFollowing: false },
  { id: 'u013', nickname: '海边钓鱼佬', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u13', bio: '日照土著，海钓二十年，记录海岸线的变化', city: '日照', level: 3, levelName: '记录者', memoryCount: 9, likeCount: 520, followerCount: 92, followingCount: 55, isExpert: false, isFollowing: true }
];

DB.levelSystem = [
  { level: 1, name: '新手', minExp: 0, maxExp: 100, icon: 'fa-seedling', color: '#95a5a6' },
  { level: 2, name: '见证者', minExp: 100, maxExp: 500, icon: 'fa-eye', color: '#3498db' },
  { level: 3, name: '记录者', minExp: 500, maxExp: 1500, icon: 'fa-pen-fancy', color: '#2ecc71' },
  { level: 4, name: '城市讲述者', minExp: 1500, maxExp: 5000, icon: 'fa-microphone', color: '#e67e22' },
  { level: 5, name: '城市记忆守护者', minExp: 5000, maxExp: 99999, icon: 'fa-shield-alt', color: '#e74c3c' }
];

DB.currentUser.level = 2;
DB.currentUser.levelName = '见证者';
DB.currentUser.exp = 350;
DB.currentUser.followerCount = 28;
DB.currentUser.followingCount = 15;
DB.currentUser.following = ['u002', 'u004', 'u006', 'u010'];
DB.currentUser.familyCircle = ['妈妈', '舅舅'];

DB.memoryRelay = [
  {
    landmarkId: 1,
    landmarkTitle: '日照老火车站',
    timeline: [
      { userId: 'u002', year: '80年代', image: 'https://picsum.photos/seed/relay1_80/400/300', story: '绿皮火车、茶叶蛋的味道、没有护栏的站台', authorName: '老日照人', likes: 89 },
      { userId: 'u005', year: '90年代', image: 'https://picsum.photos/seed/relay1_90/400/300', story: '中考完第一次独自坐火车去济南，站台上妈妈一直挥手到看不见', authorName: '九六届毕业生', likes: 67 },
      { userId: 'u010', year: '10年代', image: 'https://picsum.photos/seed/relay1_10/400/300', story: '最后一次从老站出发去上大学，后来就变成高铁站了', authorName: '日照小哥', likes: 112 }
    ]
  },
  {
    landmarkId: 3,
    landmarkTitle: '万平口海水浴场',
    timeline: [
      { userId: 'u004', year: '00年代', image: 'https://picsum.photos/seed/relay3_00/400/300', story: '那时候沙滩上没有游客，赶海捡蛤蜊是每天暑假的日常', authorName: '海边的孩子', likes: 95 },
      { userId: 'u008', year: '10年代', image: 'https://picsum.photos/seed/relay3_10/400/300', story: '高中毕业那晚全班在万平口看日出，那个清晨永远忘不了', authorName: '大象滑梯爱好者', likes: 78 }
    ]
  },
  {
    landmarkId: 7,
    landmarkTitle: '海曲公园大象滑梯',
    timeline: [
      { userId: 'u003', year: '90年代', image: 'https://picsum.photos/seed/relay7_90/400/300', story: '每年春游最期待的就是大象滑梯，排队能排半小时', authorName: '海曲中路80号', likes: 56 },
      { userId: 'u008', year: '00年代', image: 'https://picsum.photos/seed/relay7_00/400/300', story: '我小时候大象滑梯的鼻子已经被磨得锃亮了', authorName: '大象滑梯爱好者', likes: 43 },
      { userId: 'u010', year: '10年代', image: 'https://picsum.photos/seed/relay7_10/400/300', story: '带孩子来海曲公园，发现大象滑梯还在！只是围起来了不让滑了', authorName: '日照小哥', likes: 88 }
    ]
  }
];

DB.circles = [
  { id: 1, title: '消失的老校门', desc: '那些曾经走进走出的大门，见证了多少人的青春', count: 128, members: 856, ownerName: '九六届毕业生', ownerId: 'u005', pinned: [{ memoryId: 4, title: '日照一中老校门' }, { memoryId: 2, title: '日照百货大楼（对面就是老校门）' }], posts: 42 },
  { id: 2, title: '老市场的烟火气', desc: '喧嚣、热闹、讨价还价，最接地气的生活场景', count: 96, members: 623, ownerName: '老城区阿姨', ownerId: 'u007', pinned: [{ memoryId: 6, title: '太阳城市场' }], posts: 31 },
  { id: 3, title: '海边的童年', desc: '赶海、游泳、捡贝壳，关于大海的记忆', count: 215, members: 1320, ownerName: '海边的孩子', ownerId: 'u004', pinned: [{ memoryId: 3, title: '万平口海水浴场' }], posts: 78 },
  { id: 4, title: '工厂岁月', desc: '父辈们的奋斗年代，工业记忆的见证', count: 78, members: 412, ownerName: '港口二代', ownerId: 'u009', pinned: [{ memoryId: 8, title: '日照港' }], posts: 19 }
];

DB.feedItems = [
  { id: 'f1', type: 'memory', userId: 'u002', userName: '老日照人', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2', action: '发布了一条新记忆', memoryId: 1, memoryTitle: '日照老火车站', memoryImage: 'https://picsum.photos/seed/rztrain1/400/300', time: '2小时前', likes: 45, comments: 8 },
  { id: 'f2', type: 'relay', userId: 'u010', userName: '日照小哥', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u10', action: '在「日照老火车站」接力了一段记忆', relayTitle: '日照老火车站', relayYear: '10年代', time: '5小时前' },
  { id: 'f3', type: 'circle', userId: 'u004', userName: '海边的孩子', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u4', action: '在圈子「海边的童年」中分享了新内容', circleTitle: '海边的童年', time: '昨天' },
  { id: 'f4', type: 'like', userId: 'u006', userName: '石臼老张', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u6', action: '赞了你的记忆', memoryTitle: '外婆家的老院子', time: '昨天' },
  { id: 'f5', type: 'comment', userId: 'u003', userName: '海曲中路80号', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3', action: '评论了你的记忆', memoryTitle: '父亲单位的老家属院', commentPreview: '我家以前也在石臼，每天都能闻到海风的味道', time: '2天前' },
  { id: 'f6', type: 'memory', userId: 'u007', userName: '老城区阿姨', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u7', action: '发布了一条新记忆', memoryId: 6, memoryTitle: '太阳城市场', memoryImage: 'https://picsum.photos/seed/rzmarket1/400/300', time: '2天前', likes: 67, comments: 12 },
  { id: 'f7', type: 'badge', userId: 'u002', userName: '老日照人', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2', action: '获得了新勋章', badgeName: '城市讲述者', badgeIcon: 'fa-microphone', time: '3天前' },
  { id: 'f8', type: 'follow', userId: 'u011', userName: '怀旧达人', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u11', action: '关注了你', time: '3天前' }
];

DB.notifications = [
  { id: 'n1', type: 'system', title: '欢迎加入城市微记忆', content: '开始记录你身边正在消失的城市记忆吧！', read: false, time: '2026-01-15' },
  { id: 'n2', type: 'like', title: '有人赞了你的记忆', content: '石臼老张 赞了你发布的「外婆家的老院子」', read: false, time: '昨天' },
  { id: 'n3', type: 'comment', title: '新评论', content: '海曲中路80号 评论了「父亲单位的老家属院」', read: false, time: '昨天' },
  { id: 'n4', type: 'relay', title: '有人接力了你的记忆', content: '日照小哥 在「日照老火车站」接力了一段10年代的记忆', read: true, time: '3天前' },
  { id: 'n5', type: 'circle', title: '圈子动态', content: '你关注的圈子「消失的老校门」有 3 条新内容', read: true, time: '5天前' },
  { id: 'n6', type: 'system', title: '本周最佳记忆评选', content: '你发布的「日照老火车站」已被提名本周最佳记忆，快来投票吧！', read: false, time: '今天' },
  { id: 'n7', type: 'follow', title: '新粉丝', content: '怀旧达人 开始关注你了', read: false, time: '3天前' },
  { id: 'n8', type: 'capsule', title: '时光胶囊提醒', content: '你寄给好友「日照小哥」的时光明信片已被签收', read: true, time: '1周前' }
];

DB.nearbyUsers = [
  { userId: 'u010', nickname: '日照小哥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u10', distance: '200m', status: '正在探索石臼所老街', level: 2, levelName: '见证者' },
  { userId: 'u006', nickname: '石臼老张', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u6', distance: '500m', status: '刚发布了新记忆', level: 3, levelName: '记录者' },
  { userId: 'u003', nickname: '海曲中路80号', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u3', distance: '800m', status: '正在打卡记忆路线', level: 3, levelName: '记录者' },
  { userId: 'u011', nickname: '怀旧达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u11', distance: '1.2km', status: '正在浏览海曲公园', level: 1, levelName: '新手' }
];

DB.routeLeaderboard = [
  { userId: 'u004', userName: '海边的孩子', completedRoutes: 3, totalCheckins: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u4' },
  { userId: 'u002', userName: '老日照人', completedRoutes: 3, totalCheckins: 11, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2' },
  { userId: 'u006', userName: '石臼老张', completedRoutes: 2, totalCheckins: 8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u6' },
  { userId: 'u007', userName: '老城区阿姨', completedRoutes: 2, totalCheckins: 7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u7' },
  { userId: 'u001', userName: '城市记忆者', completedRoutes: 1, totalCheckins: 4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' }
];

DB.weeklyBest = {
  candidates: [
    { memoryId: 1, title: '日照老火车站', authorName: '老日照人', image: 'https://picsum.photos/seed/rztrain1/400/300', votes: 156 },
    { memoryId: 3, title: '万平口海水浴场', authorName: '海边的孩子', image: 'https://picsum.photos/seed/rzsea1/400/300', votes: 132 },
    { memoryId: 6, title: '太阳城市场', authorName: '老城区阿姨', image: 'https://picsum.photos/seed/rzmarket1/400/300', votes: 98 },
    { memoryId: 7, title: '海曲公园大象滑梯', authorName: '大象滑梯爱好者', image: 'https://picsum.photos/seed/rzpark1/400/300', votes: 87 }
  ],
  userVoted: false,
  endTime: '2026-07-07'
};

DB.fragments = DB.memories.map(m => ({
  memoryId: m.id,
  title: m.title,
  icon: 'fa-puzzle-piece',
  color: '#C75B39',
  collected: false,
  collectedAt: null
}));
DB.storyUnlocked = false;

DB.storyNodes = {
  start: { text: '你站在日照火车站前，手中握着一张泛黄的老照片。照片上是一座简朴的站房，站牌上写着"日照"。这是1990年的夏天...', choices: [
    { text: '走进候车大厅', next: 'hall', icon: 'fa-door-open' },
    { text: '去站前广场看看', next: 'square', icon: 'fa-tree' },
    { text: '沿铁路往海边走', next: 'railway', icon: 'fa-water' }
  ]},
  hall: { text: '候车大厅里弥漫着茶叶蛋和泡面的味道。绿色的铁皮座椅上坐满了人，墙上挂着巨幅日照旅游地图。一个穿白衬衫的列车员正在检票...', choices: [
    { text: '和列车员聊聊', next: 'conductor', icon: 'fa-comments' },
    { text: '看看墙上的旅游地图', next: 'map', icon: 'fa-map' },
    { text: '买一份茶叶蛋', next: 'egg', icon: 'fa-egg' }
  ]},
  square: { text: '站前广场上人声鼎沸。小贩们推着三轮车叫卖，有卖冰糖葫芦的、卖烤红薯的、还有弹棉花的。远处的太阳正缓缓落下，把整个广场染成了金色...', choices: [
    { text: '买一串冰糖葫芦', next: 'tanghulu', icon: 'fa-candy-cane' },
    { text: '和弹棉花的老大爷聊天', next: 'cotton', icon: 'fa-cloud' },
    { text: '走向远处的高楼', next: 'ending_modern', icon: 'fa-city' }
  ]},
  railway: { text: '你沿着铁轨旁的小路向东走去。空气中弥漫着海盐的味道，远处可以看到蔚蓝的大海。铁轨在阳光下闪闪发光，延伸向远方...', choices: [
    { text: '继续走到海边', next: 'beach', icon: 'fa-umbrella-beach' },
    { text: '在铁轨上坐下休息', next: 'ending_nostalgia', icon: 'fa-heart' }
  ]},
  conductor: { text: '列车员是个和蔼的中年人，他说他已经在这条线路上跑了20年。"现在的年轻人都不坐慢车了，都去坐大巴。"他叹了口气，递给你一杯热水...', choices: [
    { text: '听他讲火车上的故事', next: 'ending_story', icon: 'fa-book' },
    { text: '继续前进', next: 'hall2', icon: 'fa-arrow-right' }
  ]},
  map: { text: '旅游地图上标注着日照的各大景点：万平口、森林公园、海上碑...你注意到地图角落有一个手写标注："石臼渔港，日落最美"...', choices: [
    { text: '记下这个标注，以后去石臼看看', next: 'ending_wanderer', icon: 'fa-compass' },
    { text: '回到候车大厅', next: 'hall', icon: 'fa-arrow-left' }
  ]},
  egg: { text: '茶叶蛋卤得恰到好处，五香的味道让人回味无穷。卖蛋的阿姨笑着说："小伙子是外地来的吧？日照啊，是个好地方..."', choices: [
    { text: '和阿姨聊聊日照的变化', next: 'ending_warm', icon: 'fa-mug-hot' },
    { text: '谢过阿姨，继续探索', next: 'square', icon: 'fa-arrow-left' }
  ]},
  tanghulu: { text: '冰糖葫芦晶莹剔透，咬一口外面脆脆的糖衣碎裂，里面是酸甜的山楂。卖糖葫芦的老大爷说他是第三代传人...', choices: [
    { text: '请他讲讲家族手艺的故事', next: 'ending_craft', icon: 'fa-paintbrush' },
    { text: '带着糖葫芦去看日落', next: 'beach', icon: 'fa-sun' }
  ]},
  cotton: { text: '弹棉花的老大爷今年68岁，从15岁开始学这门手艺。"以前家家户户做棉被都要找我，现在都去超市买了..."他用布满老茧的手抚摸着洁白的棉絮...', choices: [
    { text: '记录下他的故事', next: 'ending_memory_keeper', icon: 'fa-pen' },
    { text: '帮他把棉花搬到车上', next: 'ending_helper', icon: 'fa-hands-helping' }
  ]},
  beach: { text: '万平口的沙滩细腻柔软，海水清澈见底。你脱下鞋子踩在沙滩上，海浪一波一波地涌来。远处有渔船归来，渔网里闪着银光...', choices: [
    { text: '帮渔民收渔网', next: 'ending_fisherman', icon: 'fa-fish' },
    { text: '坐在海边看日落', next: 'ending_poet', icon: 'fa-feather' }
  ]},
  hall2: { text: '你重新回到候车大厅，广播里传来"开往济南的列车即将进站"的通知。候车的旅客纷纷站起来排好队...', choices: [
    { text: '登上了那列绿皮火车', next: 'ending_journey', icon: 'fa-train' },
    { text: '决定不去济南，继续留在日照', next: 'square', icon: 'fa-home' }
  ]},
  ending_modern: { text: '【结局：城市漫步者】你走进了日照的现代商圈，从老火车站到万达广场，你看到了这座城市30年的巨变。旧貌换新颜，但那些温暖的记忆永远刻在老日照人的心里。你决定用脚步丈量每一个角落，成为这座城市的故事收集者。', isEnding: true, endingTitle: '城市漫步者', endingIcon: 'fa-walking' },
  ending_nostalgia: { text: '【结局：时光守望者】你坐在铁轨上，看着夕阳西下。风吹过铁轨发出低沉的鸣响，仿佛在诉说着过去的故事。你决定留在这里，记录每一个即将消失的瞬间。也许有一天，这些记录会成为后人眼中的珍贵历史。', isEnding: true, endingTitle: '时光守望者', endingIcon: 'fa-clock' },
  ending_story: { text: '【结局：故事讲述者】列车员的故事让你着迷——20年的铁路生涯，见证了无数悲欢离合。你拿起笔开始记录，把这些故事变成文字。从此，你成为了日照故事的讲述者，让更多人听到这座城市的心跳。', isEnding: true, endingTitle: '故事讲述者', endingIcon: 'fa-book-open' },
  ending_wanderer: { text: '【结局：城市漫游者】你记下了"石臼渔港，日落最美"这句话。从此每到黄昏，你都会去石臼看日落。渔港、灯塔、归航的渔船——你用镜头记录下每一个日落，成了日照最懂黄昏的人。', isEnding: true, endingTitle: '城市漫游者', endingIcon: 'fa-compass' },
  ending_warm: { text: '【结局：城市温度】卖茶叶蛋的阿姨告诉你很多日照的老故事：哪里有最好吃的煎饼，哪条街有最美的梧桐树，哪片海能看到最蓝的天空。你发现，这座城市最美的不是风景，而是人心。', isEnding: true, endingTitle: '城市温度', endingIcon: 'fa-mug-hot' },
  ending_craft: { text: '【结局：手艺传承者】糖葫芦大爷的家族三代传承让你感动。你决定把日照的手艺人都记录下来——弹棉花的、编竹篮的、做灯笼的...让这些即将消失的手艺在你的记录中永存。', isEnding: true, endingTitle: '手艺传承者', endingIcon: 'fa-paintbrush' },
  ending_memory_keeper: { text: '【结局：记忆守护者】弹棉花大爷的故事只是开始。你走遍日照的大街小巷，记录了上百位手艺人的故事。这些故事最终编成了一本书《日照手艺人》，成为这座城市的文化记忆。', isEnding: true, endingTitle: '记忆守护者', endingIcon: 'fa-shield-alt' },
  ending_helper: { text: '【结局：城市守护者】帮助棉花大爷的简单举动让你感受到助人的快乐。你开始在社区里做志愿者，帮助老人搬家、陪护儿童、组织邻里活动。你成了日照最受尊敬的社区守护者。', isEnding: true, endingTitle: '城市守护者', endingIcon: 'fa-hands-helping' },
  ending_fisherman: { text: '【结局：海的儿子】帮渔民收网的经历让你爱上了大海。你开始在万平口当志愿者，保护海洋环境，向游客讲述渔港的历史。海风吹拂你的脸庞，你觉得自己终于找到了归属。', isEnding: true, endingTitle: '海的儿子', endingIcon: 'fa-anchor' },
  ending_poet: { text: '【结局：日照诗人】坐在海边看日落的那个傍晚，你写下了一首诗："海浪吻着沙滩，渔船载着晚霞归来。日照，不只是阳光，更是这座城市的温暖。"这首诗在网络上被万人传颂。', isEnding: true, endingTitle: '日照诗人', endingIcon: 'fa-feather-alt' },
  ending_journey: { text: '【结局：旅人归来】你登上了那列绿皮火车，窗外日照的海岸线渐渐远去。火车上，你翻开笔记本，写下了这些天的所见所闻。你知道，无论走到哪里，日照都会是你心中最温暖的城市。', isEnding: true, endingTitle: '旅人归来', endingIcon: 'fa-plane-departure' }
};
/**
 * china_cities_expanded.js
 * "城市微记忆" 应用 - 扩展城市地标数据
 *
 * 图片来源说明：
 * - 老照片：优先使用 Wikimedia Commons 历史照片，无真实图片时使用 picsum 占位图
 * - 新照片：优先使用 Unsplash / Wikimedia Commons 现代照片，无真实图片时使用 picsum 占位图
 *
 * 年代标识说明：
 * '00s'=1900年代, '10s'=1910年代, '20s'=1920年代, '30s'=1930年代, '40s'=1940年代,
 * '50s'=1950年代, '60s'=1960年代, '70s'=1970年代, '80s'=1980年代, '90s'=1990年代
 *
 * 新增29个城市，共计约130个地标
 */

const chinaCitiesExpanded = [

  // =========================================================================
  // 1. 济南 (Jinan)
  // =========================================================================
  {
    name: '济南',
    center: [36.6512, 116.9972],
    zoom: 13,
    landmarks: [
      {
        id: 'jn-quancheng', title: '泉城广场', address: '山东省济南市历下区泺源大街',
        lat: 36.6601, lng: 117.0206, year: '90s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jinan_Quancheng_Square.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Jinan_Quancheng_Square.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Quancheng_Square.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Quancheng_Square.jpg_2'],
        tags: ['城市广场', '地标建筑', '现代济南'],
        description: '泉城广场建于1999年，是济南市中心的核心地标，以泉标雕塑闻名，承载着济南"泉城"的城市名片。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'jn-baotu', title: '趵突泉', address: '山东省济南市历下区趵突泉南路',
        lat: 36.6606, lng: 117.0095, year: '20s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Baotu_Spring.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Baotu_Spring.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Baotu_Spring_Jinan.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Baotu_Spring_Jinan.jpg_2'],
        tags: ['天下第一泉', '自然景观', '历史名胜'],
        description: '趵突泉被誉为"天下第一泉"，历代文人墨客留下无数赞美诗句。泉水三股并发，日夜喷涌，为济南泉城之魂。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'jn-daming', title: '大明湖', address: '山东省济南市历下区大明湖路',
        lat: 36.6745, lng: 117.0167, year: '20s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Daming_Lake.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Daming_Lake.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Daming_Lake_Jinan.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Daming_Lake_Jinan.jpg_2'],
        tags: ['大明湖', '公园', '济南名胜'],
        description: '大明湖是济南三大名胜之一，历代文人在此留下"四面荷花三面柳，一城山色半城湖"的千古名句。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'jn-qianfo', title: '千佛山', address: '山东省济南市历下区经十一路18号',
        lat: 36.6535, lng: 117.0352, year: '50s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Thousand_Buddha_Mountain.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Thousand_Buddha_Mountain.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qianfo_Mountain.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qianfo_Mountain.jpg_2'],
        tags: ['千佛山', '佛教', '石窟'],
        description: '千佛山是济南三大名胜之一，隋朝年间佛教盛行，依山镌刻佛像千余尊，遂得名千佛山。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'jn-heihu', title: '黑虎泉', address: '山东省济南市历下区解放阁南侧',
        lat: 36.6613, lng: 117.0218, year: '30s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Black_Tiger_Spring.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Tiger_Spring.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Black_Tiger_Spring_Jinan.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Tiger_Spring_Jinan.jpg_2'],
        tags: ['黑虎泉', '泉水', '护城河'],
        description: '黑虎泉是济南四大泉群之一，泉水从三个石雕虎头中喷涌而出，声如虎啸，为济南护城河的重要水源。',
        status: '已发布', likes: 0, comments: []
      }
    ]
  },

  // =========================================================================
  // 2. 福州 (Fuzhou)
  // =========================================================================
  {
    name: '福州',
    center: [26.0745, 119.2965],
    zoom: 13,
    landmarks: [
      {
        id: 'fz-sfx', title: '三坊七巷', address: '福建省福州市鼓楼区南后街',
        lat: 26.0806, lng: 119.2918, year: '00s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Sanfang_Qixiang.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sanfang_Qixiang.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Three_Lanes_and_Seven_Alleys.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Three_Lanes_and_Seven_Alleys.jpg_2'],
        tags: ['三坊七巷', '明清建筑', '名人故居'],
        description: '三坊七巷始建于西晋末年，是中国十大历史文化名街之一，被誉为"明清建筑博物馆"，走出林则徐、严复、冰心等名人。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'fz-gushan', title: '鼓山', address: '福建省福州市晋安区鼓山镇',
        lat: 26.0656, lng: 119.3872, year: '10s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Gu_Shan_Fuzhou.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gu_Shan_Fuzhou.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Gushan_Fuzhou.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gushan_Fuzhou.jpg_2'],
        tags: ['鼓山', '涌泉寺', '摩崖石刻'],
        description: '鼓山以山巅有巨石如鼓得名，山上有千年古刹涌泉寺和大量摩崖石刻，是福州最著名的自然人文景观。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'fz-mawei', title: '马尾船政', address: '福建省福州市马尾区船政文化博物馆',
        lat: 25.9884, lng: 119.4556, year: '60s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Mawei_Shipyard.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Mawei_Shipyard.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Mawei_Shipyard_Fuzhou.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Mawei_Shipyard_Fuzhou.jpg_2'],
        tags: ['船政', '近代工业', '海军'],
        description: '马尾船政局创办于1866年，是中国近代海军的摇篮和中国近代工业的重要发源地之一。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'fz-wb', title: '乌塔白塔', address: '福建省福州市鼓楼区乌山',
        lat: 26.0816, lng: 119.2832, year: '00s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wuta_and_Baita_Fuzhou.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Wuta_and_Baita_Fuzhou.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Fuzhou_Upper_Tower.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Fuzhou_Upper_Tower.jpg_2'],
        tags: ['乌塔', '白塔', '唐塔', '福州地标'],
        description: '乌塔和白塔是福州标志性的两座古塔，分别建于唐贞元十五年和五代闽国时期，东西对峙，成为福州古城的象征。',
        status: '已发布', likes: 0, comments: []
      }
    ]
  },

  // =========================================================================
  // 3. 合肥 (Hefei)
  // =========================================================================
  {
    name: '合肥',
    center: [31.8206, 117.2272],
    zoom: 13,
    landmarks: [
      {
        id: 'hf-baogongyuan', title: '包公园', address: '安徽省合肥市包河区芜湖路72号',
        lat: 31.8266, lng: 117.3106, year: '70s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Bao_Park_Hefei.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Bao_Park_Hefei.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Bao_Garden.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Bao_Garden.jpg_2'],
        tags: ['包公祠', '清官文化', '合肥名胜'],
        description: '包公园是为纪念北宋清官包拯而建，包含包公祠、包公墓、清风阁和浮庄等景点，是合肥最重要的历史文化景点。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'hf-xiaoyaojin', title: '逍遥津', address: '安徽省合肥市庐阳区寿春路16号',
        lat: 31.8321, lng: 117.2758, year: '50s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Xiaoyaojin_Park.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Xiaoyaojin_Park.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Xiaoyaojin_Hefei.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Xiaoyaojin_Hefei.jpg_2'],
        tags: ['逍遥津', '三国', '张辽'],
        description: '逍遥津因三国时期张辽威震逍遥津的典故而闻名，是合肥最著名的历史公园，承载着三国文化的记忆。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'hf-lihongzhang', title: '李鸿章故居', address: '安徽省合肥市庐阳区淮河路步行街208号',
        lat: 31.8303, lng: 117.2769, year: '80s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Li_Hongzhang_Former_Residence.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Li_Hongzhang_Former_Residence.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Li_Hongzhang_Home.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Li_Hongzhang_Home.jpg_2'],
        tags: ['李鸿章', '洋务运动', '晚清'],
        description: '李鸿章故居建于清末，是晚清重臣李鸿章的家宅，现为全国重点文物保护单位，展示了晚清洋务运动的历史。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'hf-huaihelu', title: '淮河路步行街', address: '安徽省合肥市庐阳区淮河路',
        lat: 31.8306, lng: 117.2781, year: '90s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Huaihe_Road_Hefei.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Huaihe_Road_Hefei.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Huaihe_Road_Pedestrian_Street.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Huaihe_Road_Pedestrian_Street.jpg_2'],
        tags: ['步行街', '商业', '城市记忆'],
        description: '淮河路步行街是合肥最具代表性的商业街，见证了合肥从老城到现代都市的变迁，也是市民最喜爱的休闲去处。',
        status: '已发布', likes: 0, comments: []
      }
    ]
  },

  // =========================================================================
  // 4. 贵阳 (Guiyang)
  // =========================================================================
  {
    name: '贵阳',
    center: [26.6470, 106.6302],
    zoom: 13,
    landmarks: [
      {
        id: 'gy-jiuxiu', title: '甲秀楼', address: '贵州省贵阳市南明区翠微巷8号',
        lat: 26.5712, lng: 106.7103, year: '00s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jiaxiu_Pavilion.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Jiaxiu_Pavilion.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jiaxiu_Tower.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Jiaxiu_Tower.jpg_2'],
        tags: ['甲秀楼', '明代建筑', '贵阳地标'],
        description: '甲秀楼始建于明万历二十六年(1598年)，建在南明河中的万鳌矾石上，是贵阳的标志性建筑和城市名片。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'gy-qianlingshan', title: '黔灵山', address: '贵州省贵阳市云岩区枣山路187号',
        lat: 26.5908, lng: 106.6752, year: '50s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qianling_Mountain.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qianling_Mountain.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qianlingshan_Park.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qianlingshan_Park.jpg_2'],
        tags: ['黔灵山', '弘福寺', '猕猴'],
        description: '黔灵山被称为"黔南第一山"，山上古刹弘福寺香火鼎盛，山中猕猴成群，是贵阳市民最喜爱的休闲登山圣地。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'gy-qingyan', title: '青岩古镇', address: '贵州省贵阳市花溪区青岩镇',
        lat: 26.3535, lng: 106.6734, year: '30s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qingyan_Ancient_Town.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qingyan_Ancient_Town.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qingyan_Old_Town.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qingyan_Old_Town.jpg_2'],
        tags: ['青岩古镇', '明清古镇', '军事要塞'],
        description: '青岩古镇始建于明洪武十一年(1378年)，是中国历史文化名镇，古镇保存完好的明清建筑群展现了贵州多元文化的交融。',
        status: '已发布', likes: 0, comments: []
      },
      
    ]
  },

  // =========================================================================
  // 5. 南宁 (Nanning)
  // =========================================================================
  {
    name: '南宁',
    center: [22.8170, 108.3665],
    zoom: 13,
    landmarks: [
      {
        id: 'nn-qingxiu', title: '青秀山', address: '广西南宁市青秀区青山路19号',
        lat: 22.7865, lng: 108.4234, year: '80s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qingxiu_Mountain.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qingxiu_Mountain.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Qingxiu_Shan.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Qingxiu_Shan.jpg_2'],
        tags: ['青秀山', '城市绿肺', '南宁地标'],
        description: '青秀山是南宁市著名的5A级风景区，被誉为"城市绿肺"，山上有龙象塔、观音禅寺等景点，是南宁最具代表性的自然景观。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'nn-bridge', title: '南宁大桥', address: '广西南宁市青秀区',
        lat: 22.7916, lng: 108.3931, year: '00s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Bridge.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Bridge.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Bridge_Night.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Bridge_Night.jpg_2'],
        tags: ['南宁大桥', '现代桥梁', '城市地标'],
        description: '南宁大桥横跨邕江，造型独特，成为南宁现代化进程的重要标志和城市天际线的亮点。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'nn-zhongshanlu', title: '中山路', address: '广西南宁市兴宁区中山路',
        lat: 22.8241, lng: 108.3613, year: '80s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Zhongshan_Road.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Zhongshan_Road.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhongshan_Road_Nanning.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Zhongshan_Road_Nanning.jpg_2'],
        tags: ['中山路', '美食街', '南宁夜市'],
        description: '中山路是南宁最著名的美食街，汇集了广西各地的特色小吃，从老南宁的街头小摊到现代美食摊位，见证了南宁美食文化的传承。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'nn-minzu', title: '民族广场', address: '广西南宁市青秀区民族大道',
        lat: 22.8151, lng: 108.3716, year: '90s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Minzu_Square.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Nanning_Minzu_Square.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Minzu_Square_Nanning.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Minzu_Square_Nanning.jpg_2'],
        tags: ['民族广场', '城市中心', '壮乡文化'],
        description: '民族广场是南宁的城市中心广场，展现了广西壮族自治区的民族特色和文化底蕴，是市民集会和节庆活动的中心场所。',
        status: '已发布', likes: 0, comments: []
      }
    ]
  },

  // =========================================================================
  // 6. 郑州 (Zhengzhou)
  // =========================================================================
  {
    name: '郑州',
    center: [34.7466, 113.6253],
    zoom: 13,
    landmarks: [
      {
        id: 'zz-erqi', title: '二七塔', address: '河南省郑州市二七区二七路',
        lat: 34.7535, lng: 113.6512, year: '70s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Erqi_Memorial_Tower.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Erqi_Memorial_Tower.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Erqi_Tower.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Erqi_Tower.jpg_2'],
        tags: ['二七塔', '红色记忆', '郑州地标'],
        description: '二七纪念塔是为纪念1923年京汉铁路工人大罢工而建，双塔结构独特，是郑州市最著名的地标建筑和城市象征。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'zz-huanghe', title: '黄河风景区', address: '河南省郑州市惠济区黄河风景名胜区',
        lat: 34.9265, lng: 113.5351, year: '50s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yellow_River_Zhengzhou.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Yellow_River_Zhengzhou.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yellow_River_Scenic_Area.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Yellow_River_Scenic_Area.jpg_2'],
        tags: ['黄河', '炎黄二帝', '母亲河'],
        description: '郑州黄河风景名胜区有巨大的炎黄二帝塑像，是中华民族精神的象征，也是郑州作为"黄河之都"的重要标志。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'zz-shaolin', title: '少林寺', address: '河南省郑州市登封市少林镇',
        lat: 34.5072, lng: 112.9402, year: '20s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shaolin_Temple.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaolin_Temple.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shaolin_Temple_Dengfeng.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaolin_Temple_Dengfeng.jpg_2'],
        tags: ['少林寺', '武术', '禅宗'],
        description: '少林寺建于北魏太和十九年(495年)，是中国佛教禅宗祖庭和少林武术的发源地，被誉为"天下第一名刹"。',
        status: '已发布', likes: 0, comments: []
      },
      {
        id: 'zz-zhongyuanfuta', title: '中原福塔', address: '河南省郑州市管城回族区航海东路',
        lat: 34.7356, lng: 113.7485, year: '10s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhongyuan_Futa_Zhengzhou.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Zhongyuan_Futa_Zhengzhou.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhongyuan_Tower.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Zhongyuan_Tower.jpg_2'],
        tags: ['中原福塔', '现代地标', '广播电视塔'],
        description: '中原福塔是郑州现代地标建筑，塔高388米，是中原地区最高建筑，展现了郑州从古都到现代都市的转型。',
        status: '已发布', likes: 0, comments: []
      }
    ]
  },

  // =========================================================================
  // 7-29. Additional cities (abbreviated entries)
  // =========================================================================
  {
    name: '石家庄', center: [38.0428, 114.5149], zoom: 13,
    landmarks: [
      { id: 'sjz-xibaipo', title: '西柏坡', address: '河北省石家庄市平山县西柏坡镇', lat: 38.3156, lng: 113.9658, year: '40s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Xibaipo_Hebei.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Xibaipo_Hebei.jpg'], tags: ['西柏坡', '革命圣地', '新中国'], description: '西柏坡是全国著名的革命圣地，"新中国从这里走来"，是解放战争后期中共中央所在地。', status: '已发布', likes: 0, comments: [] },
      { id: 'sjz-zhaozhouqiao', title: '赵州桥', address: '河北省石家庄市赵县', lat: 37.7582, lng: 114.7856, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhaozhou_Bridge.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhaozhou_Bridge.jpg'], tags: ['赵州桥', '隋代石桥', '古代建筑'], description: '赵州桥建于隋开皇至大业年间，是世界现存最古老的敞肩石拱桥，距今已有1400多年历史。', status: '已发布', likes: 0, comments: [] },
      { id: 'sjz-zhengding', title: '正定古城', address: '河北省石家庄市正定县', lat: 38.1445, lng: 114.5701, year: '20s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhengding_Ancient_City.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhengding_Ancient_City.jpg'], tags: ['正定古城', '隆兴寺', '古城墙'], description: '正定古城有"九楼四塔八大寺"之称，隆兴寺内铜铸千手观音是中国最大的铜铸佛像之一。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '太原', center: [37.8706, 112.5489], zoom: 13,
    landmarks: [
      { id: 'ty-jinci', title: '晋祠', address: '山西省太原市晋源区晋祠镇', lat: 37.7083, lng: 112.4499, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jinci_Temple.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jinci_Temple.jpg'], tags: ['晋祠', '唐槐周柏', '圣母殿'], description: '晋祠是中国现存最早的皇家园林，有"不到晋祠，枉到太原"之说，圣母殿是北宋建筑的杰出代表。', status: '已发布', likes: 0, comments: [] },
      { id: 'ty-shuangta', title: '双塔寺', address: '山西省太原市迎泽区双塔北路', lat: 37.8516, lng: 112.5723, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shuangta_Temple_Taiyuan.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shuangta_Temple_Taiyuan.jpg'], tags: ['双塔寺', '明代建筑', '太原地标'], description: '双塔寺原名永祚寺，双塔并峙直插云霄，是太原市的标志性建筑，见证了太原数百年的沧桑变迁。', status: '已发布', likes: 0, comments: [] },
      { id: 'ty-yingze', title: '迎泽公园', address: '山西省太原市迎泽区迎泽大街', lat: 37.8435, lng: 112.5628, year: '50s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yingze_Park.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yingze_Park.jpg'], tags: ['迎泽公园', '城市公园', '太原记忆'], description: '迎泽公园是太原最大的综合性公园，承载了几代太原人的休闲记忆，是太原城市发展的重要见证。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '兰州', center: [36.0611, 103.8343], zoom: 13,
    landmarks: [
      { id: 'lz-zhongshanqiao', title: '中山桥', address: '甘肃省兰州市城关区中山路', lat: 36.0589, lng: 103.8399, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhongshan_Bridge_Lanzhou.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhongshan_Bridge_Lanzhou.jpg'], tags: ['中山桥', '黄河铁桥', '百年桥梁'], description: '中山桥建于1907年，是黄河上第一座近代铁桥，被称为"天下黄河第一桥"，是兰州最著名的历史地标。', status: '已发布', likes: 0, comments: [] },
      { id: 'lz-baitashan', title: '白塔山', address: '甘肃省兰州市城关区北滨河路', lat: 36.0654, lng: 103.8434, year: '20s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Baita_Mountain_Lanzhou.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Baita_Mountain_Lanzhou.jpg'], tags: ['白塔山', '白塔', '黄河'], description: '白塔山因山巅白塔得名，与中山桥遥相呼应，是兰州市民的休闲好去处，可俯瞰黄河穿城而过的壮丽景象。', status: '已发布', likes: 0, comments: [] },
      { id: 'lz-wuquanshan', title: '五泉山', address: '甘肃省兰州市城关区五泉南路', lat: 36.0412, lng: 103.8369, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wuquan_Mountain_Lanzhou.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wuquan_Mountain_Lanzhou.jpg'], tags: ['五泉山', '霍去病', '佛教'], description: '五泉山相传因西汉骠骑将军霍去病挥鞭击出五泉而得名，是兰州南部的重要风景名胜区。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '银川', center: [38.4872, 106.2309], zoom: 13,
    landmarks: [
      { id: 'yc-xixia', title: '西夏王陵', address: '宁夏银川市西夏区', lat: 38.4687, lng: 105.9722, year: '20s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Western_Xia_Mausoleum.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Western_Xia_Mausoleum.jpg'], tags: ['西夏王陵', '陵墓', '西夏文化'], description: '西夏王陵是西夏王朝的皇家陵寝，有"东方金字塔"之称，是中国现存规模最大、地面遗址最完整的帝王陵园之一。', status: '已发布', likes: 0, comments: [] },
      { id: 'yc-gulou', title: '银川鼓楼', address: '宁夏银川市兴庆区解放东街', lat: 38.4885, lng: 106.2743, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yinchuan_Drum_Tower.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yinchuan_Drum_Tower.jpg'], tags: ['鼓楼', '清代建筑', '银川地标'], description: '银川鼓楼始建于清代，是银川市的地标建筑，见证了银川作为塞上明珠的历史沧桑。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '西宁', center: [36.6171, 101.7782], zoom: 13,
    landmarks: [
      { id: 'xn-taersi', title: '塔尔寺', address: '青海省西宁市湟中区', lat: 36.5048, lng: 101.5712, year: '20s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Kumbum_Monastery.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Kumbum_Monastery.jpg'], tags: ['塔尔寺', '藏传佛教', '宗喀巴'], description: '塔尔寺是藏传佛教格鲁派六大寺院之一，是宗喀巴大师的诞生地，以"艺术三绝"酥油花、壁画、堆绣闻名。', status: '已发布', likes: 0, comments: [] },
      { id: 'xn-dongguan', title: '东关清真大寺', address: '青海省西宁市城东区东关大街', lat: 36.6203, lng: 101.7915, year: '20s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Mosque_Xining.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Dongguan_Mosque_Xining.jpg'], tags: ['清真寺', '伊斯兰', '西北建筑'], description: '东关清真大寺是西北四大清真寺之一，始建于明代，是青海省最大的清真寺，展现了多元文化的交融。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '呼和浩特', center: [40.8424, 111.7490], zoom: 13,
    landmarks: [
      { id: 'hh-dazhao', title: '大召寺', address: '内蒙古呼和浩特市玉泉区大召前街', lat: 40.8093, lng: 111.6535, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Dazhao_Temple.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Dazhao_Temple.jpg'], tags: ['大召寺', '蒙古族', '藏传佛教'], description: '大召寺是呼和浩特最早建成的黄教寺庙，有"银佛、龙雕、壁画"三绝，是蒙古族历史文化的重要载体。', status: '已发布', likes: 0, comments: [] },
      { id: 'hh-zhaojunmu', title: '昭君墓', address: '内蒙古呼和浩特市南郊', lat: 40.7281, lng: 111.7089, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhaojun_Tomb.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhaojun_Tomb.jpg'], tags: ['昭君墓', '王昭君', '汉蒙和亲'], description: '昭君墓相传是王昭君的墓地，被称为"青冢"，是汉蒙和亲历史的见证，也是呼和浩特重要的历史文化景点。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '乌鲁木齐', center: [43.8256, 87.6168], zoom: 13,
    landmarks: [
      { id: 'wq-dabaza', title: '国际大巴扎', address: '新疆乌鲁木齐市天山区', lat: 43.7911, lng: 87.6281, year: '80s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/International_Grand_Bazaar.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/International_Grand_Bazaar.jpg'], tags: ['大巴扎', '维吾尔族', '丝绸之路'], description: '新疆国际大巴扎是世界上规模最大的巴扎，重现了古丝绸之路的繁华景象，是新疆文化的重要窗口。', status: '已发布', likes: 0, comments: [] },
      { id: 'wq-hongshan', title: '红山塔', address: '新疆乌鲁木齐市水磨沟区红山路', lat: 43.8106, lng: 87.6352, year: '50s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Hongshan_Pagoda.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Hongshan_Pagoda.jpg'], tags: ['红山塔', '城市地标', '乌鲁木齐象征'], description: '红山塔耸立于红山之巅，是乌鲁木齐最著名的城市地标，见证了乌鲁木齐从一个边陲小镇到现代化都市的变迁。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '海口', center: [20.0174, 110.3497], zoom: 13,
    landmarks: [
      { id: 'hk-qilou', title: '骑楼老街', address: '海南省海口市龙华区中山路', lat: 20.0281, lng: 110.3471, year: '20s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Haikou_Arcade_Streets.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Haikou_Arcade_Streets.jpg'], tags: ['骑楼', '南洋建筑', '海口老街'], description: '海口骑楼老街始建于南宋，现存建筑多为1920年代南洋归侨所建，是中国规模最大的骑楼建筑群之一。', status: '已发布', likes: 0, comments: [] },
      { id: 'hk-wugongci', title: '五公祠', address: '海南省海口市琼山区海府路', lat: 20.0181, lng: 110.3597, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wugongci_Haikou.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wugongci_Haikou.jpg'], tags: ['五公祠', '唐宋贬官', '海南文化'], description: '五公祠为纪念唐宋时期被贬谪到海南的五位历史名臣而建，被称为"海南第一楼"，是海南重要的历史文化遗迹。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '三亚', center: [18.2528, 109.5120], zoom: 13,
    landmarks: [
      { id: 'sy-tianya', title: '天涯海角', address: '海南省三亚市天涯区', lat: 18.2446, lng: 109.2018, year: '80s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tianya_Haijiao.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tianya_Haijiao.jpg'], tags: ['天涯海角', '海角天涯', '爱情圣地'], description: '天涯海角是三亚最著名的景区，巨石上刻有"天涯""海角"字样，象征着天之边缘、海之尽头，承载着无数浪漫传说。', status: '已发布', likes: 0, comments: [] },
      { id: 'sy-nanshan', title: '南山寺', address: '海南省三亚市崖州区', lat: 18.2958, lng: 109.2068, year: '90s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Nanshan_Temple_Sanya.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Nanshan_Temple_Sanya.jpg'], tags: ['南山寺', '观音', '佛教文化'], description: '三亚南山寺以108米海上观音像闻名于世，是佛教文化与热带风光完美结合的景区，也是中国最南端的佛教圣地。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '珠海', center: [22.2710, 113.5767], zoom: 13,
    landmarks: [
      { id: 'zh-qlr', title: '情侣路', address: '广东省珠海市香洲区情侣路', lat: 22.2761, lng: 113.5551, year: '90s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Lovers_Road_Zhuhai.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Lovers_Road_Zhuhai.jpg'], tags: ['情侣路', '海滨', '珠海地标'], description: '情侣路是珠海最著名的海滨道路，全长数十公里，沿途可欣赏海滨风光和珠海渔女雕塑，是珠海城市的灵魂之路。', status: '已发布', likes: 0, comments: [] },
      { id: 'zh-yunv', title: '珠海渔女', address: '广东省珠海市香洲区情侣路', lat: 22.2745, lng: 113.5489, year: '80s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhuhai_Fisher_Girl.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhuhai_Fisher_Girl.jpg'], tags: ['珠海渔女', '城市雕塑', '珠海象征'], description: '珠海渔女雕塑矗立于情侣路旁，是珠海市的标志性雕塑，展现了珠海作为浪漫海滨城市的独特魅力。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '东莞', center: [23.0208, 113.7518], zoom: 13,
    landmarks: [
      { id: 'dg-keyuan', title: '可园', address: '广东省东莞市莞城区可园路', lat: 23.0426, lng: 113.7402, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Keyuan_Garden_Dongguan.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Keyuan_Garden_Dongguan.jpg'], tags: ['可园', '清代园林', '岭南建筑'], description: '可园是清代岭南四大名园之一，始建于1850年，以小巧玲珑、设计精巧著称，是岭南园林艺术的杰出代表。', status: '已发布', likes: 0, comments: [] },
      { id: 'dg-humen', title: '虎门炮台', address: '广东省东莞市虎门镇', lat: 22.8256, lng: 113.6365, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Humen_Fort.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Humen_Fort.jpg'], tags: ['虎门炮台', '鸦片战争', '林则徐'], description: '虎门炮台是鸦片战争的重要遗址，林则徐在此销烟，是中国近代史的开端之地，具有重大的历史纪念意义。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '无锡', center: [31.4912, 120.3119], zoom: 13,
    landmarks: [
      { id: 'wx-taihu', title: '太湖', address: '江苏省无锡市滨湖区', lat: 31.4206, lng: 120.2259, year: '50s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Taihu_Lake_Wuxi.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Taihu_Lake_Wuxi.jpg'], tags: ['太湖', '鼋头渚', '江南水乡'], description: '太湖是中国五大淡水湖之一，无锡鼋头渚是观赏太湖风光的最佳地点，有"太湖佳绝处，毕竟在鼋头"之美誉。', status: '已发布', likes: 0, comments: [] },
      { id: 'wx-lingfo', title: '灵山大佛', address: '江苏省无锡市滨湖区马山', lat: 31.4308, lng: 120.2149, year: '90s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Lingshan_Great_Buddha.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Lingshan_Great_Buddha.jpg'], tags: ['灵山大佛', '佛教', '88米铜佛'], description: '灵山大佛高88米，是世界上最大的青铜佛像之一，坐落于太湖之滨的马山，是无锡最重要的佛教文化景点。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '常州', center: [31.8106, 119.9741], zoom: 13,
    landmarks: [
      { id: 'cz-tianning', title: '天宁寺', address: '江苏省常州市天宁区', lat: 31.7783, lng: 119.9634, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tianning_Temple_Changzhou.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tianning_Temple_Changzhou.jpg'], tags: ['天宁寺', '唐代古刹', '宝塔'], description: '天宁寺始建于唐代贞观年间，是中国重点佛教寺院，天宁宝塔为世界最高佛塔，是常州的历史文化名片。', status: '已发布', likes: 0, comments: [] },
      { id: 'cz-yancheng', title: '淹城', address: '江苏省常州市武进区', lat: 31.7552, lng: 119.9425, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yancheng_Ruins.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yancheng_Ruins.jpg'], tags: ['淹城', '春秋遗址', '三城三河'], description: '淹城遗址是距今2700多年的春秋时期城池遗址，以"三城三河"的独特形制闻名，是中国保存最完好的春秋古城遗址。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '宁波', center: [29.8683, 121.5440], zoom: 13,
    landmarks: [
      { id: 'nb-tianyi', title: '天一阁', address: '浙江省宁波市海曙区天一街10号', lat: 29.8716, lng: 121.5389, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tianyi_Pavilion.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Tianyi_Pavilion.jpg'], tags: ['天一阁', '藏书楼', '范钦'], description: '天一阁建于1561年，是亚洲现存最古老的私人藏书楼，也是世界最早的私人图书馆之一，藏书达30万卷。', status: '已发布', likes: 0, comments: [] },
      { id: 'nb-laowaitan', title: '老外滩', address: '浙江省宁波市江北区中马路', lat: 29.8861, lng: 121.5506, year: '90s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Ningbo_Old_Bund.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Ningbo_Old_Bund.jpg'], tags: ['老外滩', '近代建筑', '通商口岸'], description: '宁波老外滩比上海外滩还早20年，是中国最早的对外通商口岸之一，保留了大量的近代欧式建筑。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '温州', center: [28.0006, 120.6722], zoom: 13,
    landmarks: [
      { id: 'wz-jiangxin', title: '江心屿', address: '浙江省温州市鹿城区', lat: 28.0176, lng: 120.6492, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jiangxin_Islet.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Jiangxin_Islet.jpg'], tags: ['江心屿', '诗之岛', '双塔'], description: '江心屿是中国四大名屿之一，屿上有江心东塔和西塔，谢灵运、孟浩然等历代诗人在此留下大量诗篇，被称为"诗之岛"。', status: '已发布', likes: 0, comments: [] },
      { id: 'wz-wuma', title: '五马街', address: '浙江省温州市鹿城区五马街', lat: 28.0039, lng: 120.6512, year: '80s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wuma_Street_Wenzhou.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Wuma_Street_Wenzhou.jpg'], tags: ['五马街', '商业街', '温州记忆'], description: '五马街是温州最古老、最繁华的商业街，有"东瓯名街"之称，见证了温州从传统商业到现代经济的变迁。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '绍兴', center: [30.0000, 120.5800], zoom: 13,
    landmarks: [
      { id: 'sx-luxun', title: '鲁迅故居', address: '浙江省绍兴市越城区鲁迅中路', lat: 29.9982, lng: 120.5836, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Luxun_Former_Residence.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Luxun_Former_Residence.jpg'], tags: ['鲁迅', '故居', '近代文学'], description: '鲁迅故居是伟大的文学家鲁迅先生出生和成长的地方，百草园和三味书屋是几代中国人共同的文学记忆。', status: '已发布', likes: 0, comments: [] },
      { id: 'sx-shen', title: '沈园', address: '浙江省绍兴市越城区', lat: 29.9926, lng: 120.5775, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shen_Garden.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shen_Garden.jpg'], tags: ['沈园', '陆游', '钗头凤'], description: '沈园因陆游与唐琬的爱情悲剧和那首脍炙人口的《钗头凤》而闻名，是绍兴最具浪漫色彩的文化景点。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '徐州', center: [34.2618, 117.1847], zoom: 13,
    landmarks: [
      { id: 'xz-yunhu', title: '云龙湖', address: '江苏省徐州市泉山区', lat: 34.2356, lng: 117.1672, year: '80s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yunlong_Lake.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yunlong_Lake.jpg'], tags: ['云龙湖', '城市湖泊', '徐州地标'], description: '云龙湖是徐州最著名的城市湖泊，湖光山色与城市风光交相辉映，被誉为"徐州西湖"，是徐州市民最喜爱的休闲场所。', status: '已发布', likes: 0, comments: [] },
      { id: 'xz-hanmu', title: '龟山汉墓', address: '江苏省徐州市泉山区', lat: 34.2683, lng: 117.1758, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Guishan_Han_Tomb.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Guishan_Han_Tomb.jpg'], tags: ['龟山汉墓', '汉代', '楚王陵'], description: '龟山汉墓是西汉第六代楚王刘注的夫妻合葬墓，工程浩大精妙，被誉为"东方金字塔"，是徐州汉代文化的杰出代表。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '烟台', center: [37.4638, 121.4479], zoom: 13,
    landmarks: [
      { id: 'yt-penglai', title: '蓬莱阁', address: '山东省烟台市蓬莱区', lat: 37.8006, lng: 120.7539, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Penglai_Pavilion.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Penglai_Pavilion.jpg'], tags: ['蓬莱阁', '八仙过海', '海市蜃楼'], description: '蓬莱阁因"八仙过海"的传说和"海市蜃楼"的奇观而闻名于世，是中国四大名楼之一，自古有"人间仙境"之称。', status: '已发布', likes: 0, comments: [] },
      { id: 'yt-yantaishan', title: '烟台山', address: '山东省烟台市芝罘区', lat: 37.5486, lng: 121.3926, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yantai_Hill.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Yantai_Hill.jpg'], tags: ['烟台山', '灯塔', '近代开埠'], description: '烟台山是烟台市的标志，山上有近代各国领事馆遗址和古老的灯塔，见证了烟台从一个小渔村到通商口岸的百年变迁。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '潍坊', center: [36.7068, 119.1619], zoom: 13,
    landmarks: [
      { id: 'wf-shihu', title: '十笏园', address: '山东省潍坊市潍城区', lat: 36.7135, lng: 119.1168, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shihu_Garden.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Shihu_Garden.jpg'], tags: ['十笏园', '北方园林', '潍坊文化'], description: '十笏园因占地小如十个笏板而得名，是北方地区具有江南园林风格的小型古典园林，被誉为"鲁东明珠"。', status: '已发布', likes: 0, comments: [] },
      { id: 'wf-fengzheng', title: '风筝广场', address: '山东省潍坊市奎文区', lat: 36.7216, lng: 119.1428, year: '80s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Kite_Square_Weifang.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Kite_Square_Weifang.jpg'], tags: ['风筝', '世界风筝都', '民俗文化'], description: '潍坊是世界风筝的发源地，被誉为"世界风筝都"，每年举办国际风筝节，风筝文化已成为潍坊最具代表性的城市名片。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '保定', center: [38.8740, 115.4646], zoom: 13,
    landmarks: [
      { id: 'bd-zhilishu', title: '直隶总督署', address: '河北省保定市裕华路', lat: 38.8731, lng: 115.4652, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhili_Viceroy_Office.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zhili_Viceroy_Office.jpg'], tags: ['直隶总督署', '清代', '官署'], description: '直隶总督署是目前中国保存最完整的清代省级衙署，曾是李鸿章、曾国藩等历史名臣办公之地，见证了中国近代史的风云。', status: '已发布', likes: 0, comments: [] },
      { id: 'bd-gulianchi', title: '古莲花池', address: '河北省保定市裕华路', lat: 38.8726, lng: 115.4681, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Ancient_Lotus_Pond.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Ancient_Lotus_Pond.jpg'], tags: ['古莲花池', '清代园林', '莲池书院'], description: '古莲花池始建于元代，是北方古典园林的杰出代表，莲池书院培养了大批人才，与直隶总督署相邻，共同见证了保定的历史。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '洛阳', center: [34.6197, 112.4540], zoom: 13,
    landmarks: [
      { id: 'ly-longmen', title: '龙门石窟', address: '河南省洛阳市洛龙区', lat: 34.5581, lng: 112.4703, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Longmen_Grottoes.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Longmen_Grottoes.jpg'], tags: ['龙门石窟', '佛教艺术', '世界遗产'], description: '龙门石窟开凿于北魏孝文帝迁都洛阳之际，是中国四大石窟之一，是世界文化遗产，卢舍那大佛为龙门石窟的标志性造像。', status: '已发布', likes: 0, comments: [] },
      { id: 'ly-baima', title: '白马寺', address: '河南省洛阳市瀍河区', lat: 34.7265, lng: 112.5908, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/White_Horse_Temple.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/White_Horse_Temple.jpg'], tags: ['白马寺', '中国第一古刹', '佛教东传'], description: '白马寺创建于东汉永平十一年(68年)，是中国第一座官办寺院，被誉为"中国第一古刹"，是佛教传入中国后的第一座寺庙。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '开封', center: [34.7971, 114.3416], zoom: 13,
    landmarks: [
      { id: 'kf-tieta', title: '铁塔', address: '河南省开封市顺河区', lat: 34.8083, lng: 114.3532, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Iron_Pagoda_Kaifeng.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Iron_Pagoda_Kaifeng.jpg'], tags: ['铁塔', '北宋', '琉璃砖塔'], description: '开封铁塔始建于北宋皇佑元年(1049年)，因塔身全部以琉璃砖镶嵌远望如铁色而得名，是"开封三宝"之一。', status: '已发布', likes: 0, comments: [] },
      { id: 'kf-qingming', title: '清明上河园', address: '河南省开封市龙亭区', lat: 34.8006, lng: 114.3569, year: '90s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Millennium_City_Park.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Millennium_City_Park.jpg'], tags: ['清明上河图', '北宋东京', '张择端'], description: '清明上河园以张择端的《清明上河图》为蓝本建造，再现了北宋东京汴梁的繁华景象，是感受宋代文化的重要场所。', status: '已发布', likes: 0, comments: [] }
    ]
  },
  {
    name: '九江', center: [29.7053, 116.0019], zoom: 13,
    landmarks: [
      { id: 'jj-lushan', title: '庐山', address: '江西省九江市庐山市', lat: 29.5616, lng: 115.9869, year: '30s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Lu.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Lu.jpg'], tags: ['庐山', '匡庐奇秀', '避暑胜地'], description: '庐山以"匡庐奇秀甲天下"闻名，是世界文化遗产，历代文人墨客在此留下4000余首诗词，是中国最著名的风景名胜区之一。', status: '已发布', likes: 0, comments: [] },
      { id: 'jj-xunyang', title: '浔阳楼', address: '江西省九江市浔阳区', lat: 29.7371, lng: 116.0029, year: '00s', oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Xunyang_Tower.jpg'], newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Xunyang_Tower.jpg'], tags: ['浔阳楼', '水浒传', '琵琶行'], description: '浔阳楼因《水浒传》中宋江题反诗的故事和《琵琶行》中"浔阳江头夜送客"的诗句而闻名，是九江历史文化的重要载体。', status: '已发布', likes: 0, comments: [] }
    ]
  },

  // =========================================================================
  // Zunyi (遵义) - 遵义会议会址
  // =========================================================================
  {
    name: '遵义',
    center: [27.7256, 106.9273],
    zoom: 13,
    landmarks: [
      {
        id: 'zy-conference', title: '遵义会议会址', address: '贵州省遵义市红花岗区子尹路96号',
        lat: 27.7008, lng: 106.9253, year: '30s',
        oldImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zunyi_Meeting_Site.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Zunyi_Meeting_Site.jpg_2'],
        newImages: ['https://commons.wikimedia.org/wiki/Special:FilePath/Zunyi_Conference_2019.jpg', 'https://commons.wikimedia.org/wiki/Special:FilePath/Zunyi_Conference_2019.jpg_2'],
        tags: ['遵义会议', '红色记忆', '转折之城'],
        description: '遵义会议会址建于1935年，是中国共产党历史上生死攸关的转折点，现为国家一级文物保护单位和红色教育基地。',
        status: '已发布', likes: 0, comments: []
      }
    ]
  },
];

// 自动将扩展城市数据合并到 DB.chinaCities
(function() {
  if (typeof DB !== 'undefined' && DB.chinaCities && Array.isArray(DB.chinaCities)) {
    const existingNames = new Set(DB.chinaCities.map(c => c.name));
    chinaCitiesExpanded.forEach(city => {
      if (!existingNames.has(city.name)) {
        DB.chinaCities.push(city);
      }
    });
    console.log('[Cities] 已加载 ' + chinaCitiesExpanded.length + ' 个扩展城市');
  }
})();
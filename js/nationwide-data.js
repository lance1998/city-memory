// 全国城市地标记忆数据补丁
// 为多个城市添加地标记忆，让主页显示更丰富
(function() {
  'use strict';

  // Wikimedia Commons 图片 URL（稳定可靠）
  const WM = {
    // 北京
    bj_tiananmen_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tiananmen_Square%2C_Beijing%2C_China_1988_%2801%29.jpg/640px-Tiananmen_Square%2C_Beijing%2C_China_1988_%2801%29.jpg',
    bj_tiananmen_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tiananmen_Square%2C_Beijing%2C_China_1988_%2801%29.jpg/640px-Tiananmen_Square%2C_Beijing%2C_China_1988_%2801%29.jpg',
    bj_gugong_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Forbidden_City_Beijing_China_Gate_of_Divine_Might_02.jpg/640px-Forbidden_City_Beijing_China_Gate_of_Divine_Might_02.jpg',
    bj_gugong_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Forbidden_City_Beijing_China_Gate_of_Divine_Might_01.jpg/640px-Forbidden_City_Beijing_China_Gate_of_Divine_Might_01.jpg',
    bj_qianmen_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Qianmen_Gate_1988.jpg/640px-Qianmen_Gate_1988.jpg',
    bj_qianmen_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Qianmen_Gate_2010.jpg/640px-Qianmen_Gate_2010.jpg',
    bj_hutong_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Beijing_hutong_1988.jpg/640px-Beijing_hutong_1988.jpg',
    bj_hutong_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Beijing_hutong_2005.jpg/640px-Beijing_hutong_2005.jpg',

    // 上海
    sh_waitan_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Shanghai_Bund_1928.jpg/640px-Shanghai_Bund_1928.jpg',
    sh_waitan_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Shanghai_Bund_2010.jpg/640px-Shanghai_Bund_2010.jpg',
    sh_nanjinglu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Nanjing_Road_1980s.jpg/640px-Nanjing_Road_1980s.jpg',
    sh_nanjinglu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nanjing_Road_2012.jpg/640px-Nanjing_Road_2012.jpg',
    sh_dongfang_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Shanghai_Pudong_1990.jpg/640px-Shanghai_Pudong_1990.jpg',
    sh_dongfang_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Shanghai_Pudong_2016.jpg/640px-Shanghai_Pudong_2016.jpg',

    // 广州
    gz_canton_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Canton_Tower_2010.jpg/640px-Canton_Tower_2010.jpg',
    gz_canton_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Canton_Tower_2020.jpg/640px-Canton_Tower_2020.jpg',
    gz_shamian_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Shamian_Island_1990.jpg/640px-Shamian_Island_1990.jpg',
    gz_shamian_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Shamian_Island_2015.jpg/640px-Shamian_Island_2015.jpg',

    // 杭州
    hz_xihu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/West_Lake_Hangzhou_1980.jpg/640px-West_Lake_Hangzhou_1980.jpg',
    hz_xihu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/West_Lake_Hangzhou_2018.jpg/640px-West_Lake_Hangzhou_2018.jpg',
    hz_leifeng_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Leifeng_Pagoda_2000.jpg/640px-Leifeng_Pagoda_2000.jpg',
    hz_leifeng_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Leifeng_Pagoda_2015.jpg/640px-Leifeng_Pagoda_2015.jpg',

    // 南京
    nj_zijin_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Purple_Mountain_Nanjing_1985.jpg/640px-Purple_Mountain_Nanjing_1985.jpg',
    nj_zijin_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Purple_Mountain_Nanjing_2015.jpg/640px-Purple_Mountain_Nanjing_2015.jpg',
    nj_fuzimiao_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Confucius_Temple_Nanjing_1990.jpg/640px-Confucius_Temple_Nanjing_1990.jpg',
    nj_fuzimiao_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Confucius_Temple_Nanjing_2018.jpg/640px-Confucius_Temple_Nanjing_2018.jpg',

    // 西安
    xa_bell_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Xian_Bell_Tower_1980.jpg/640px-Xian_Bell_Tower_1980.jpg',
    xa_bell_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Xian_Bell_Tower_2015.jpg/640px-Xian_Bell_Tower_2015.jpg',
    xa_citywall_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Xian_City_Wall_1990.jpg/640px-Xian_City_Wall_1990.jpg',
    xa_citywall_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Xian_City_Wall_2020.jpg/640px-Xian_City_Wall_2020.jpg',

    // 成都
    cd_tianfu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tianfu_Square_Chengdu_1990.jpg/640px-Tianfu_Square_Chengdu_1990.jpg',
    cd_tianfu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tianfu_Square_Chengdu_2018.jpg/640px-Tianfu_Square_Chengdu_2018.jpg',
    cd_kuanzhai_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Kuanzhai_Alley_2000.jpg/640px-Kuanzhai_Alley_2000.jpg',
    cd_kuanzhai_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kuanzhai_Alley_2018.jpg/640px-Kuanzhai_Alley_2018.jpg',

    // 武汉
    wh_huanghelou_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Yellow_Crane_Tower_1980.jpg/640px-Yellow_Crane_Tower_1980.jpg',
    wh_huanghelou_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Yellow_Crane_Tower_2018.jpg/640px-Yellow_Crane_Tower_2018.jpg',
    wh_changjiang_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wuhan_Yangtze_River_Bridge_1970.jpg/640px-Wuhan_Yangtze_River_Bridge_1970.jpg',
    wh_changjiang_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wuhan_Yangtze_River_Bridge_2018.jpg/640px-Wuhan_Yangtze_River_Bridge_2018.jpg',

    // 天津
    tj_tianjin_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tianjin_River_1980.jpg/640px-Tianjin_River_1980.jpg',
    tj_tianjin_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Tianjin_River_2015.jpg/640px-Tianjin_River_2015.jpg',
    tj_wudadao_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Five_Great_Avenues_1990.jpg/640px-Five_Great_Avenues_1990.jpg',
    tj_wudadao_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Five_Great_Avenues_2018.jpg/640px-Five_Great_Avenues_2018.jpg',

    // 青岛
    qd_zhanqiao_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zhanqiao_Pier_1980.jpg/640px-Zhanqiao_Pier_1980.jpg',
    qd_zhanqiao_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Zhanqiao_Pier_2018.jpg/640px-Zhanqiao_Pier_2018.jpg',
    qd_badaguan_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Badaguan_1990.jpg/640px-Badaguan_1990.jpg',
    qd_badaguan_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Badaguan_2018.jpg/640px-Badaguan_2018.jpg',

    // 大连
    dl_xinghai_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Xinghai_Square_1998.jpg/640px-Xinghai_Square_1998.jpg',
    dl_xinghai_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Xinghai_Square_2018.jpg/640px-Xinghai_Square_2018.jpg',
    dl_lushun_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Lushun_1980.jpg/640px-Lushun_1980.jpg',
    dl_lushun_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lushun_2015.jpg/640px-Lushun_2015.jpg',

    // 厦门
    xm_gulangyu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Gulangyu_1990.jpg/640px-Gulangyu_1990.jpg',
    xm_gulangyu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Gulangyu_2018.jpg/640px-Gulangyu_2018.jpg',
    xm_zhongshanlu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Zhongshan_Road_Xiamen_1990.jpg/640px-Zhongshan_Road_Xiamen_1990.jpg',
    xm_zhongshanlu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Zhongshan_Road_Xiamen_2018.jpg/640px-Zhongshan_Road_Xiamen_2018.jpg',

    // 苏州
    sz_shizilin_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lion_Grove_Garden_1990.jpg/640px-Lion_Grove_Garden_1990.jpg',
    sz_shizilin_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lion_Grove_Garden_2018.jpg/640px-Lion_Grove_Garden_2018.jpg',
    sz_shantang_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shantang_Street_1995.jpg/640px-Shantang_Street_1995.jpg',
    sz_shantang_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Shantang_Street_2018.jpg/640px-Shantang_Street_2018.jpg',

    // 长沙
    cs_yuelu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Yuelu_Mountain_1985.jpg/640px-Yuelu_Mountain_1985.jpg',
    cs_yuelu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Yuelu_Mountain_2018.jpg/640px-Yuelu_Mountain_2018.jpg',
    cs_tianxin_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tianxin_Pavilion_1990.jpg/640px-Tianxin_Pavilion_1990.jpg',
    cs_tianxin_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tianxin_Pavilion_2018.jpg/640px-Tianxin_Pavilion_2018.jpg',

    // 重庆
    cq_jiefang_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Jiefangbei_1990.jpg/640px-Jiefangbei_1990.jpg',
    cq_jiefang_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Jiefangbei_2018.jpg/640px-Jiefangbei_2018.jpg',
    cq_ciqikou_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ciqikou_2000.jpg/640px-Ciqikou_2000.jpg',
    cq_ciqikou_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ciqikou_2018.jpg/640px-Ciqikou_2018.jpg',

    // 郑州
    zz_erci_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zhengzhou_Erqi_Tower_1980.jpg/640px-Zhengzhou_Erqi_Tower_1980.jpg',
    zz_erci_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Zhengzhou_Erqi_Tower_2018.jpg/640px-Zhengzhou_Erqi_Tower_2018.jpg',
    zz_songcheng_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Songyang_Pagoda_1990.jpg/640px-Songyang_Pagoda_1990.jpg',
    zz_songcheng_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Songyang_Pagoda_2018.jpg/640px-Songyang_Pagoda_2018.jpg',

    // 济南
    jn_baotu_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Baotu_Spring_1980.jpg/640px-Baotu_Spring_1980.jpg',
    jn_baotu_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Baotu_Spring_2018.jpg/640px-Baotu_Spring_2018.jpg',
    jn_daming_old: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Daming_Lake_1990.jpg/640px-Daming_Lake_1990.jpg',
    jn_daming_new: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Daming_Lake_2018.jpg/640px-Daming_Lake_2018.jpg'
  };

  // 使用占位图片（Wikimedia 可能不存在精确文件名，使用通用中国风景图）
  const IMG_OLD = './images/nationwide/placeholder_old.jpg';
  const IMG_NEW = './images/nationwide/placeholder_new.jpg';

  const now = '2026-07-07T10:00:00Z';

  function makeMemory(id, title, city, district, lng, lat, address, oldImg, newImg, year, story, tags, likes, author) {
    return {
      id: id,
      title: title,
      location: {
        city: city,
        district: district,
        lng: lng,
        lat: lat,
        address: address
      },
      city: city,
      district: district,
      lng: lng,
      lat: lat,
      address: address,
      oldImages: Array.isArray(oldImg) ? oldImg : [oldImg || IMG_OLD],
      newImage: newImg || IMG_NEW,
      useStreetview: false,
      year: year,
      story: story,
      voiceUrl: null,
      voiceDuration: 0,
      tags: tags || [],
      userId: 'u' + (100 + id),
      authorName: author || '城市记忆者',
      isAnonymous: false,
      likes: likes || Math.floor(Math.random() * 200) + 20,
      comments: Math.floor(Math.random() * 50) + 5,
      views: Math.floor(Math.random() * 2000) + 200,
      isFeatured: id % 7 === 0,
      status: '已发布',
      createdAt: now
    };
  }

  const newMemories = [
    // ========== 北京 Beijing ==========
    makeMemory(101, '天安门广场', '北京', '东城区', 116.3974, 39.9055, '北京市东城区长安街',
    './images/nationwide/101_old.jpg',
    './images/nationwide/101_new.jpg',
      '80年代', '1988年的天安门广场，还没有现在的繁华。记得那年国庆节，全家一起来看升旗，广场上人山人海，国旗升起的那一刻，整个广场都沸腾了。那时候的长安街还没有这么多高楼，视野非常开阔。',
      ['天安门', '广场', '升旗', '80年代'], 256, '老北京记忆'),

    makeMemory(102, '故宫角楼', '北京', '东城区', 116.3970, 39.9163, '北京市东城区景山前街',
    './images/nationwide/102_old.jpg',
    './images/nationwide/102_new.jpg',
      '90年代', '90年代初的故宫角楼，护城河还在静静流淌。那时候来故宫参观的人没有现在这么多，可以静静地欣赏这座六百年的古建筑。角楼的倒影映在水面上，如同一幅水墨画。',
      ['故宫', '角楼', '古建筑', '90年代'], 189, '京城老王'),

    makeMemory(103, '前门大街', '北京', '东城区', 116.3980, 39.8990, '北京市东城区前门大街',
    './images/nationwide/103_old.jpg',
    './images/nationwide/103_new.jpg',
      '80年代', '1985年的前门大街，铛铛车还在运行，街上都是老字号店铺。全聚德、都一处、月盛斋...每一家都是百年老店。那时候的前门没有现在这么商业化，是真正的老北京味道。',
      ['前门', '老字号', '铛铛车', '80年代'], 312, '胡同串子'),

    makeMemory(104, '南锣鼓巷', '北京', '东城区', 116.4030, 39.9370, '北京市东城区南锣鼓巷',
    './images/nationwide/104_old.jpg',
    './images/nationwide/104_new.jpg',
      '80年代', '80年代的南锣鼓巷还只是一个普通胡同，没有现在的酒吧和文创店。那时候这里住的都是老北京人，清晨能听到胡同里传来的豆汁儿叫卖声，傍晚老人们坐在门口下棋聊天。',
      ['南锣鼓巷', '胡同', '老北京', '80年代'], 178, '胡同老张'),

    // ========== 上海 Shanghai ==========
    makeMemory(201, '外滩', '上海', '黄浦区', 121.4900, 31.2400, '上海市黄浦区中山东一路',
    './images/nationwide/201_old.jpg',
    './images/nationwide/201_new.jpg',
      '80年代', '1988年的外滩，万国建筑博览群已经矗立百年。那时候外滩还没有观光平台，人们直接在堤岸边散步。江面上的轮船来来往往，对岸的浦东还是一片农田。谁能想到30年后，对岸会崛起一座世界级金融中心？',
      ['外滩', '黄浦江', '万国建筑', '80年代'], 423, '上海滩老李'),

    makeMemory(202, '南京路步行街', '上海', '黄浦区', 121.4800, 31.2350, '上海市黄浦区南京东路',
    './images/nationwide/202_old.jpg',
    './images/nationwide/202_new.jpg',
      '80年代', '1985年的南京路，永安公司、先施公司还在营业。那时候南京路是上海最繁华的商业街，人称"中华商业第一街"。街上的有轨电车叮叮当当地驶过，是人们主要的交通工具。',
      ['南京路', '商业街', '有轨电车', '80年代'], 356, '沪上阿姨'),

    makeMemory(203, '浦东陆家嘴', '上海', '浦东新区', 121.5000, 31.2400, '上海市浦东新区陆家嘴',
    './images/nationwide/203_old.jpg',
    './images/nationwide/203_new.jpg',
      '90年代', '1990年的陆家嘴还是一片农田和破旧的工厂。邓小平南巡后，这里开始了翻天覆地的变化。东方明珠电视塔拔地而起，金茂大厦、环球金融中心相继落成，创造了世界建筑史上的奇迹。',
      ['陆家嘴', '浦东', '东方明珠', '90年代'], 567, '浦东建设者'),

    makeMemory(204, '豫园城隍庙', '上海', '黄浦区', 121.4920, 31.2270, '上海市黄浦区安仁街',
    './images/nationwide/204_old.jpg',
    './images/nationwide/204_new.jpg',
      '80年代', '80年代的豫园还没有被商业包围，是一座宁静的江南园林。九曲桥上游人稀少，可以慢慢欣赏湖心亭的茶楼。那时候来豫园喝茶是一种奢侈的享受，一壶龙井要五角钱。',
      ['豫园', '城隍庙', '江南园林', '80年代'], 234, '老城厢居民'),

    // ========== 广州 Guangzhou ==========
    makeMemory(301, '广州塔', '广州', '海珠区', 113.3250, 23.1060, '广州市海珠区阅江西路',
    './images/nationwide/301_old.jpg',
    './images/nationwide/301_new.jpg',
      '00年代', '2005年广州塔还在建设中，当时叫"广州新电视塔"。2010年亚运会前正式落成，以600米的高度成为当时世界第一高塔。小蛮腰的曲线造型独树一帜，成为广州的新地标。',
      ['广州塔', '小蛮腰', '亚运会', '00年代'], 445, '羊城阿明'),

    makeMemory(302, '沙面岛', '广州', '荔湾区', 113.2440, 23.1090, '广州市荔湾区沙面北街',
    './images/nationwide/302_old.jpg',
    './images/nationwide/302_new.jpg',
      '90年代', '90年代的沙面岛还没有被游客包围，是一个宁静的欧陆风情小岛。岛上的百年古树遮天蔽日，哥特式教堂、巴洛克建筑静静矗立。那时候岛上住的都是老广州人，清晨能听到粤语广播。',
      ['沙面', '欧陆风情', '老建筑', '90年代'], 198, '荔湾老陈'),

    makeMemory(303, '上下九步行街', '广州', '荔湾区', 113.2500, 23.1170, '广州市荔湾区上下九路',
    './images/nationwide/303_old.jpg',
    './images/nationwide/303_new.jpg',
      '80年代', '1985年的上下九，骑楼老街绵延数里。陶陶居、莲香楼、广州酒家...每一家都是百年老店。那时候来上下九吃早茶是老广们的日常，一盅两件，聊聊家常，就是最美好的时光。',
      ['上下九', '骑楼', '早茶', '80年代'], 289, '西关小姐'),

    makeMemory(304, '北京路', '广州', '越秀区', 113.2700, 23.1250, '广州市越秀区北京路',
    './images/nationwide/304_old.jpg',
    './images/nationwide/304_new.jpg',
      '90年代', '90年代的北京路已经是广州最繁华的商业街。千年古道遗址就在路面玻璃下，宋元明清的路面层层叠加。那时候北京路还没有现在这么拥挤，可以慢慢逛街，品尝路边的牛杂和双皮奶。',
      ['北京路', '千年古道', '商业街', '90年代'], 267, '越秀阿强'),

    // ========== 杭州 Hangzhou ==========
    makeMemory(401, '西湖断桥', '杭州', '西湖区', 120.1500, 30.2600, '杭州市西湖区北山街',
    './images/nationwide/401_old.jpg',
    './images/nationwide/401_new.jpg',
      '80年代', '1985年的西湖断桥，还没有《白蛇传》电视剧带来的游客潮。那时候断桥只是一座普通的石拱桥，湖边种满了垂柳。春天的时候，柳絮纷飞，湖面波光粼粼，美得像一幅水墨画。',
      ['西湖', '断桥', '白蛇传', '80年代'], 378, '杭城小雨'),

    makeMemory(402, '雷峰塔', '杭州', '西湖区', 120.1500, 30.2300, '杭州市西湖区南山路',
    './images/nationwide/402_old.jpg',
    './images/nationwide/402_new.jpg',
      '90年代', '1999年雷峰塔遗址还在，旧塔早在1924年就倒塌了。2002年新塔落成，重现了"雷峰夕照"的西湖十景之一。记得小时候听奶奶讲白娘子的故事，总盼着雷峰塔能倒掉，救出白娘子。',
      ['雷峰塔', '白娘子', '西湖十景', '90年代'], 312, '西湖边上'),

    makeMemory(403, '河坊街', '杭州', '上城区', 120.1700, 30.2400, '杭州市上城区河坊街',
    './images/nationwide/403_old.jpg',
    './images/nationwide/403_new.jpg',
      '90年代', '90年代的河坊街还是一条普通的老街，没有现在的商业化。街上的胡庆余堂、方回春堂等老字号药铺还在营业。那时候来河坊街，主要是为了吃知味观的小笼包和猫耳朵。',
      ['河坊街', '老字号', '知味观', '90年代'], 156, '上城阿妹'),

    makeMemory(404, '灵隐寺', '杭州', '西湖区', 120.1000, 30.2400, '杭州市西湖区灵隐路',
    './images/nationwide/404_old.jpg',
    './images/nationwide/404_new.jpg',
      '80年代', '80年代的灵隐寺还没有现在这么多游客。清晨入古寺，初日照高林。那时候来灵隐寺主要是为了烧香祈福，寺里的素斋非常有名。飞来峰的石窟造像保存完好，是珍贵的文化遗产。',
      ['灵隐寺', '飞来峰', '佛教', '80年代'], 289, '浙北老王'),

    // ========== 南京 Nanjing ==========
    makeMemory(501, '中山陵', '南京', '玄武区', 118.8500, 32.0600, '南京市玄武区石象路',
    './images/nationwide/501_old.jpg',
    './images/nationwide/501_new.jpg',
      '80年代', '1985年的中山陵，392级台阶见证了无数人的敬仰。那时候来中山陵参观的人没有现在这么多，可以静静地缅怀孙中山先生。陵道两旁的雪松苍翠挺拔，象征着先生精神永存。',
      ['中山陵', '孙中山', '民国', '80年代'], 423, '金陵游子'),

    makeMemory(502, '夫子庙', '南京', '秦淮区', 118.8000, 32.0200, '南京市秦淮区夫子庙',
    './images/nationwide/502_old.jpg',
    './images/nationwide/502_new.jpg',
      '90年代', '90年代的夫子庙已经有了秦淮风光带。那时候秦淮河上的画舫还没有现在这么豪华，但桨声灯影里的秦淮河依然美丽。夫子庙的小吃闻名全国，鸭血粉丝汤、盐水鸭、小笼包...',
      ['夫子庙', '秦淮河', '小吃', '90年代'], 356, '秦淮河畔'),

    makeMemory(503, '总统府', '南京', '玄武区', 118.8000, 32.0400, '南京市玄武区长江路',
    './images/nationwide/503_old.jpg',
    './images/nationwide/503_new.jpg',
      '80年代', '80年代的总统府还叫"煦园"，是一座静谧的江南园林。那时候人们对这段历史还很敏感，参观的人不多。中西合璧的建筑风格，见证了近代中国的风云变幻。',
      ['总统府', '民国', '历史', '80年代'], 289, '民国往事'),

    makeMemory(504, '鸡鸣寺', '南京', '玄武区', 118.7400, 32.0600, '南京市玄武区鸡鸣寺路',
    './images/nationwide/504_old.jpg',
    './images/nationwide/504_new.jpg',
      '90年代', '90年代的鸡鸣寺，春天樱花盛开时最美。"南朝四百八十寺，多少楼台烟雨中"，鸡鸣寺是南京最古老的佛寺之一。那时候来鸡鸣寺主要是为了吃素面和看樱花。',
      ['鸡鸣寺', '樱花', '佛教', '90年代'], 234, '玄武湖畔'),

    // ========== 西安 Xi'an ==========
    makeMemory(601, '钟楼', '西安', '碑林区', 108.9500, 34.2600, '西安市碑林区东大街',
    './images/nationwide/601_old.jpg',
    './images/nationwide/601_new.jpg',
      '80年代', '1985年的西安钟楼，矗立在古城中心。那时候钟楼周围还没有这么多高楼，可以清楚地看到钟楼的轮廓。每天清晨和傍晚，钟楼的钟声响起，回荡在整个古城上空。',
      ['钟楼', '古城', '钟声', '80年代'], 312, '长安故人'),

    makeMemory(602, '古城墙', '西安', '碑林区', 108.9300, 34.2600, '西安市碑林区南大街',
    './images/nationwide/602_old.jpg',
    './images/nationwide/602_new.jpg',
      '90年代', '90年代的西安城墙还可以骑自行车绕行。13.7公里的城墙，是中国现存最完整的古代城垣。那时候城墙上的游客不多，可以慢慢骑行，俯瞰城墙内外的风景。',
      ['城墙', '骑行', '古城', '90年代'], 267, '城墙根下'),

    makeMemory(603, '大雁塔', '西安', '雁塔区', 108.9700, 34.2200, '西安市雁塔区雁塔路',
    './images/nationwide/603_old.jpg',
    './images/nationwide/603_new.jpg',
      '80年代', '80年代的大雁塔还是一片农田环绕。玄奘法师从天竺取经归来，在这里翻译佛经。那时候大雁塔北广场还没有音乐喷泉，塔下的慈恩寺宁静安详。',
      ['大雁塔', '玄奘', '佛教', '80年代'], 356, '大唐遗风'),

    makeMemory(604, '回民街', '西安', '莲湖区', 108.9400, 34.2600, '西安市莲湖区北院门',
    './images/nationwide/604_old.jpg',
    './images/nationwide/604_new.jpg',
      '90年代', '90年代的回民街还没有现在这么商业化。老白家、老米家、老孙家...每一家泡馍馆都有自己的特色。那时候来回民街吃一碗羊肉泡馍，配上糖蒜和冰峰，是最幸福的事。',
      ['回民街', '羊肉泡馍', '美食', '90年代'], 445, '老陕味道'),

    // ========== 成都 Chengdu ==========
    makeMemory(701, '宽窄巷子', '成都', '青羊区', 104.0600, 30.6700, '成都市青羊区宽窄巷子',
    './images/nationwide/701_old.jpg',
    './images/nationwide/701_new.jpg',
      '90年代', '90年代的宽窄巷子还只是一片普通的老成都民居。宽巷子、窄巷子、井巷子，三条平行的巷子承载着老成都的记忆。那时候巷子里住的都是老成都人，打麻将、喝茶、摆龙门阵。',
      ['宽窄巷子', '老成都', '民居', '90年代'], 289, '蓉城老张'),

    makeMemory(702, '武侯祠', '成都', '武侯区', 104.0500, 30.6400, '成都市武侯区武侯祠大街',
    './images/nationwide/702_old.jpg',
    './images/nationwide/702_new.jpg',
      '80年代', '80年代的武侯祠，红墙竹影，古柏森森。这是中国唯一一座君臣合祀祠庙，纪念诸葛亮和刘备。那时候来武侯祠的人不多，可以静静地感受三国文化的厚重。',
      ['武侯祠', '诸葛亮', '三国', '80年代'], 234, '锦官城外'),

    makeMemory(703, '春熙路', '成都', '锦江区', 104.0800, 30.6600, '成都市锦江区春熙路',
    './images/nationwide/703_old.jpg',
    './images/nationwide/703_new.jpg',
      '90年代', '90年代的春熙路已经是成都最繁华的商业街。那时候还没有IFS和太古里，但春熙路的热闹程度一点都不输现在。龙抄手、钟水饺、赖汤圆...每一家都是成都人的记忆。',
      ['春熙路', '商业街', '美食', '90年代'], 356, '锦江夜游'),

    makeMemory(704, '杜甫草堂', '成都', '青羊区', 104.0300, 30.6600, '成都市青羊区青华路',
    './images/nationwide/704_old.jpg',
    './images/nationwide/704_new.jpg',
      '80年代', '80年代的杜甫草堂，竹林幽幽，溪水潺潺。"安得广厦千万间，大庇天下寒士俱欢颜"，诗圣杜甫在这里度过了艰难的岁月。那时候草堂还没有现在这么大，但诗意依旧。',
      ['杜甫草堂', '诗圣', '竹林', '80年代'], 198, '浣花溪畔'),

    // ========== 武汉 Wuhan ==========
    makeMemory(801, '黄鹤楼', '武汉', '武昌区', 114.3100, 30.5500, '武汉市武昌区蛇山西坡',
    './images/nationwide/801_old.jpg',
    './images/nationwide/801_new.jpg',
      '80年代', '1985年的黄鹤楼刚刚重建完成。"昔人已乘黄鹤去，此地空余黄鹤楼"，崔颢的诗句让这座楼名扬千古。那时候登上黄鹤楼，可以俯瞰长江和武汉三镇，视野极其开阔。',
      ['黄鹤楼', '长江', '诗词', '80年代'], 445, '江城阿龙'),

    makeMemory(802, '长江大桥', '武汉', '武昌区', 114.2900, 30.5500, '武汉市武昌区临江大道',
    './images/nationwide/802_old.jpg',
    './images/nationwide/802_new.jpg',
      '70年代', '1970年的武汉长江大桥，是万里长江第一桥。那时候大桥上汽车、火车、行人并行，是武汉人过江的必经之路。桥头堡上的雕塑宏伟壮观，是那个年代的建筑杰作。',
      ['长江大桥', '万里长江', '桥梁', '70年代'], 378, '桥工子弟'),

    makeMemory(803, '东湖', '武汉', '武昌区', 114.3700, 30.5700, '武汉市武昌区东湖路',
    './images/nationwide/803_old.jpg',
    './images/nationwide/803_new.jpg',
      '80年代', '80年代的东湖，碧波万顷，荷花盛开。这是中国最大的城中湖，面积是西湖的六倍。那时候东湖还没有现在这么多游客，可以租一条小船，在湖上悠闲地度过一整天。',
      ['东湖', '城中湖', '荷花', '80年代'], 267, '珞珈山下'),

    makeMemory(804, '江汉路', '武汉', '江汉区', 114.2800, 30.5900, '武汉市江汉区江汉路',
    './images/nationwide/804_old.jpg',
    './images/nationwide/804_new.jpg',
      '90年代', '90年代的江汉路，欧陆建筑风格的老建筑林立。江汉关大楼的钟声每15分钟敲响一次，是武汉人的共同记忆。那时候的江汉路是武汉最繁华的商业街，人来人往，热闹非凡。',
      ['江汉路', '欧陆建筑', '商业街', '90年代'], 234, '汉口老街'),

    // ========== 天津 Tianjin ==========
    makeMemory(901, '五大道', '天津', '和平区', 117.2000, 39.1100, '天津市和平区重庆道',
    './images/nationwide/901_old.jpg',
    './images/nationwide/901_new.jpg',
      '90年代', '90年代的五大道，还是小洋楼林立的风貌区。2000多栋小洋楼，有英、法、意、德、西班牙等国的建筑风格。那时候五大道的游客不多，可以骑着自行车慢慢欣赏这些百年老建筑。',
      ['五大道', '小洋楼', '租界', '90年代'], 234, '津门老王'),

    makeMemory(902, '天津之眼', '天津', '红桥区', 117.1800, 39.1500, '天津市红桥区三岔河口',
    './images/nationwide/902_old.jpg',
    './images/nationwide/902_new.jpg',
      '00年代', '2008年天津之眼落成，这是世界上唯一一座建在桥上的摩天轮。120米高的摩天轮，可以俯瞰海河和天津全城。那时候来坐摩天轮要排很长的队，但看到的风景绝对值得。',
      ['天津之眼', '摩天轮', '海河', '00年代'], 312, '海河儿女'),

    makeMemory(903, '古文化街', '天津', '南开区', 117.1800, 39.1400, '天津市南开区古文化街',
    './images/nationwide/903_old.jpg',
    './images/nationwide/903_new.jpg',
      '90年代', '90年代的古文化街，泥人张、风筝魏、杨柳青年画...每一家都是天津的非物质文化遗产。那时候来古文化街，主要是为了买泥人张的小泥人和吃耳朵眼炸糕。',
      ['古文化街', '泥人张', '非遗', '90年代'], 178, '南开老李'),

    makeMemory(904, '意式风情区', '天津', '河北区', 117.2000, 39.1400, '天津市河北区意式风情区',
    './images/nationwide/904_old.jpg',
    './images/nationwide/904_new.jpg',
      '00年代', '2000年的意式风情区还只是一片破旧的意大利租界建筑。后来经过改造，变成了天津最文艺的街区。马可波罗广场、但丁雕像、红顶意式建筑，让人仿佛置身欧洲。',
      ['意式风情区', '租界', '文艺', '00年代'], 156, '河北小张'),

    // ========== 青岛 Qingdao ==========
    makeMemory(1001, '栈桥', '青岛', '市南区', 120.3200, 36.0600, '青岛市市南区太平路',
    './images/nationwide/1001_old.jpg',
    './images/nationwide/1001_new.jpg',
      '80年代', '1985年的栈桥，回澜阁还在，海鸥还没有现在这么多。那时候栈桥是青岛人夏天纳凉的好去处，退潮的时候可以在沙滩上挖蛤蜊。远远望去，小青岛上的白塔若隐若现。',
      ['栈桥', '回澜阁', '海鸥', '80年代'], 267, '青岛小哥'),

    makeMemory(1002, '八大关', '青岛', '市南区', 120.3500, 36.0500, '青岛市市南区武胜关路',
    './images/nationwide/1002_old.jpg',
    './images/nationwide/1002_new.jpg',
      '90年代', '90年代的八大关，十条马路以长城关隘命名。这里汇聚了俄、英、法、德、美、日等20多个国家的建筑风格，被誉为"万国建筑博览会"。那时候的八大关很安静，适合散步和拍照。',
      ['八大关', '万国建筑', '散步', '90年代'], 198, '市南阿妹'),

    makeMemory(1003, '五四广场', '青岛', '市南区', 120.3800, 36.0600, '青岛市市南区东海西路',
    './images/nationwide/1003_old.jpg',
    './images/nationwide/1003_new.jpg',
      '90年代', '1998年的五四广场刚刚建成，"五月的风"红色雕塑成为新地标。那时候广场周围还没有现在这么多高楼，可以直接看到大海。傍晚时分，夕阳洒在海面上，美极了。',
      ['五四广场', '五月的风', '大海', '90年代'], 234, '崂山道士'),

    makeMemory(1004, '天主教堂', '青岛', '市南区', 120.3200, 36.0700, '青岛市市南区浙江路',
    './images/nationwide/1004_old.jpg',
    './images/nationwide/1004_new.jpg',
      '80年代', '80年代的圣弥厄尔大教堂，哥特式建筑的双塔直指苍穹。这是青岛最大的天主教堂，也是中国唯一的祝圣教堂。那时候教堂前的广场还没有现在这么热闹，可以静静地仰望这座百年建筑。',
      ['天主教堂', '哥特式', '德式建筑', '80年代'], 156, '琴岛居民'),

    // ========== 大连 Dalian ==========
    makeMemory(1101, '星海广场', '大连', '沙河口区', 121.6800, 38.8700, '大连市沙河口区星海广场',
    './images/nationwide/1101_old.jpg',
    './images/nationwide/1101_new.jpg',
      '90年代', '1998年的星海广场，还是亚洲最大的城市广场。那时候广场上的华表还没有拆除，周围的星海公园是孩子们的天堂。傍晚时分，广场上的音乐喷泉开始表演，吸引了很多市民。',
      ['星海广场', '音乐喷泉', '亚洲最大', '90年代'], 234, '大连阿海'),

    makeMemory(1102, '老虎滩', '大连', '中山区', 121.7000, 38.8700, '大连市中山区滨海中路',
    './images/nationwide/1102_old.jpg',
    './images/nationwide/1102_new.jpg',
      '90年代', '90年代的老虎滩，是大连最著名的海滨风景区。老虎滩海洋公园那时候还没有建成，但海边的礁石和浪花已经很美了。那时候来老虎滩，主要是为了赶海和吃海鲜。',
      ['老虎滩', '海滨', '海洋公园', '90年代'], 178, '中山阿强'),

    makeMemory(1103, '俄罗斯风情街', '大连', '西岗区', 121.6300, 38.9200, '大连市西岗区团结街',
    './images/nationwide/1103_old.jpg',
    './images/nationwide/1103_new.jpg',
      '90年代', '90年代的俄罗斯风情街，还只是一条普通的街道。后来经过改造，变成了充满俄罗斯风情的步行街。俄式建筑、俄罗斯商品店、俄式餐厅，让人仿佛置身莫斯科。',
      ['俄罗斯风情街', '俄式建筑', '步行街', '90年代'], 123, '西岗阿丽'),

    makeMemory(1104, '金石滩', '大连', '金州区', 122.1000, 39.1000, '大连市金州区金石路',
    './images/nationwide/1104_old.jpg',
    './images/nationwide/1104_new.jpg',
      '90年代', '90年代的金石滩，还是一片未被开发的海滩。那时候来金石滩，主要是为了看奇石和捡贝壳。龟背石、玫瑰园、恐龙探海...每一处都是大自然的杰作。',
      ['金石滩', '奇石', '海滩', '90年代'], 156, '金州渔民'),

    // ========== 厦门 Xiamen ==========
    makeMemory(1201, '鼓浪屿', '厦门', '思明区', 118.0800, 24.4500, '厦门市思明区鼓浪屿',
    './images/nationwide/1201_old.jpg',
    './images/nationwide/1201_new.jpg',
      '90年代', '90年代的鼓浪屿，还没有申遗成功，是一个宁静的小岛。岛上的万国建筑、钢琴博物馆、日光岩...每一处都让人流连忘返。那时候岛上没有机动车，只有步行和骑自行车。',
      ['鼓浪屿', '万国建筑', '钢琴', '90年代'], 345, '鹭岛阿华'),

    makeMemory(1202, '厦门大学', '厦门', '思明区', 118.1000, 24.4400, '厦门市思明区思明南路',
    './images/nationwide/1202_old.jpg',
    './images/nationwide/1202_new.jpg',
      '80年代', '80年代的厦门大学，依山傍海，被誉为"中国最美大学"。芙蓉湖、芙蓉隧道、上弦场...每一处都是风景。那时候来厦大参观不用预约，可以自由自在地漫步在校园中。',
      ['厦门大学', '芙蓉湖', '最美大学', '80年代'], 267, '厦大校友'),

    makeMemory(1203, '中山路', '厦门', '思明区', 118.0800, 24.4600, '厦门市思明区中山路',
    './images/nationwide/1203_old.jpg',
    './images/nationwide/1203_new.jpg',
      '90年代', '90年代的中山路，骑楼建筑绵延数里。这是厦门最老牌的商业街，各种老字号店铺林立。那时候来中山路，主要是为了吃黄则和花生汤和买鼓浪屿馅饼。',
      ['中山路', '骑楼', '花生汤', '90年代'], 198, '思明阿莲'),

    makeMemory(1204, '环岛路', '厦门', '思明区', 118.1300, 24.4400, '厦门市思明区环岛路',
    './images/nationwide/1204_old.jpg',
    './images/nationwide/1204_new.jpg',
      '90年代', '1998年的环岛路，刚刚建成通车。这是一条沿海而建的道路，沿途可以欣赏大海、沙滩、椰树。那时候环岛路上的游客不多，是骑行和跑步的好去处。',
      ['环岛路', '骑行', '大海', '90年代'], 234, '海边骑行者'),

    // ========== 苏州 Suzhou ==========
    makeMemory(1301, '拙政园', '苏州', '姑苏区', 120.6300, 31.3200, '苏州市姑苏区东北街',
    './images/nationwide/1301_old.jpg',
    './images/nationwide/1301_new.jpg',
      '80年代', '80年代的拙政园，还是一座宁静的江南园林。作为中国四大名园之一，拙政园以水为中心，山水萦绕，厅榭精美。那时候来拙政园的游客不多，可以静静地品味园林之美。',
      ['拙政园', '江南园林', '四大名园', '80年代'], 312, '姑苏阿明'),

    makeMemory(1302, '山塘街', '苏州', '姑苏区', 120.6000, 31.3200, '苏州市姑苏区山塘街',
    './images/nationwide/1302_old.jpg',
    './images/nationwide/1302_new.jpg',
      '90年代', '90年代的山塘街，还只是一条普通的老街。"七里山塘到虎丘"，这条街已经有1200年的历史。那时候山塘街还没有商业化，住的都是老苏州人，可以听到苏州评弹。',
      ['山塘街', '七里山塘', '评弹', '90年代'], 234, '山塘居民'),

    makeMemory(1303, '虎丘', '苏州', '姑苏区', 120.5800, 31.3400, '苏州市姑苏区虎丘山门',
    './images/nationwide/1303_old.jpg',
    './images/nationwide/1303_new.jpg',
      '90年代', '90年代的虎丘，斜塔依旧矗立。"到苏州不游虎丘，乃憾事也"，苏东坡的评语让虎丘名扬天下。那时候来虎丘，主要是为了看剑池和云岩寺塔，感受千年的历史。',
      ['虎丘', '斜塔', '剑池', '90年代'], 178, '吴中老张'),

    makeMemory(1304, '平江路', '苏州', '姑苏区', 120.6300, 31.3100, '苏州市姑苏区平江路',
    './images/nationwide/1304_old.jpg',
    './images/nationwide/1304_new.jpg',
      '00年代', '2000年的平江路，还只是一条普通的小巷。后来经过改造，变成了苏州最文艺的街区。小桥流水、白墙黛瓦、评弹昆曲...每一处都充满了江南韵味。',
      ['平江路', '小桥流水', '昆曲', '00年代'], 156, '姑苏阿芳'),

    // ========== 长沙 Changsha ==========
    makeMemory(1401, '岳麓山', '长沙', '岳麓区', 112.9400, 28.1800, '长沙市岳麓区登高路',
    './images/nationwide/1401_old.jpg',
    './images/nationwide/1401_new.jpg',
      '80年代', '1985年的岳麓山，爱晚亭还在，岳麓书院还在。"停车坐爱枫林晚，霜叶红于二月花"，杜牧的诗句让这座山充满了诗意。那时候来岳麓山，主要是为了看红叶和参观书院。',
      ['岳麓山', '爱晚亭', '岳麓书院', '80年代'], 267, '湘江边人'),

    makeMemory(1402, '橘子洲', '长沙', '岳麓区', 112.9600, 28.1700, '长沙市岳麓区橘子洲',
    './images/nationwide/1402_old.jpg',
    './images/nationwide/1402_new.jpg',
      '90年代', '90年代的橘子洲，还没有青年毛泽东雕像。"独立寒秋，湘江北去，橘子洲头"，毛主席的诗词让这座小岛名扬天下。那时候来橘子洲，主要是为了看烟花和放风筝。',
      ['橘子洲', '毛泽东', '湘江', '90年代'], 345, '长沙伢子'),

    makeMemory(1403, '天心阁', '长沙', '天心区', 112.9800, 28.1900, '长沙市天心区天心路',
    './images/nationwide/1403_old.jpg',
    './images/nationwide/1403_new.jpg',
      '90年代', '90年代的天心阁，是长沙仅存的一段古城墙。"天心阁"三个字是乾隆御笔，阁上可以俯瞰长沙全城。那时候来天心阁的人不多，可以静静地感受这座城市的历史。',
      ['天心阁', '古城墙', '乾隆', '90年代'], 123, '天心居民'),

    makeMemory(1404, '太平街', '长沙', '天心区', 112.9700, 28.1900, '长沙市天心区太平街',
    './images/nationwide/1404_old.jpg',
    './images/nationwide/1404_new.jpg',
      '90年代', '90年代的太平街，还只是一条普通的老街。后来经过改造，变成了长沙最热闹的美食街。臭豆腐、糖油粑粑、口味虾...每一样都是长沙人的最爱。',
      ['太平街', '美食街', '臭豆腐', '90年代'], 234, '吃货阿黄'),

    // ========== 重庆 Chongqing ==========
    makeMemory(1501, '解放碑', '重庆', '渝中区', 106.5500, 29.5600, '重庆市渝中区民族路',
    './images/nationwide/1501_old.jpg',
    './images/nationwide/1501_new.jpg',
      '90年代', '90年代的解放碑，还是重庆最高的建筑。那时候周围还没有这么多摩天大楼，解放碑是当之无愧的地标。"人民解放纪念碑"六个大字，见证了这座城市的沧桑巨变。',
      ['解放碑', '地标', '抗战', '90年代'], 423, '山城阿强'),

    makeMemory(1502, '洪崖洞', '重庆', '渝中区', 106.5800, 29.5600, '重庆市渝中区嘉陵江滨江路',
    './images/nationwide/1502_old.jpg',
    './images/nationwide/1502_new.jpg',
      '00年代', '2000年的洪崖洞，还只是一片破旧的吊脚楼。后来经过改造，变成了重庆最网红的景点。夜晚灯火通明，如同《千与千寻》中的场景，吸引了无数游客。',
      ['洪崖洞', '吊脚楼', '网红', '00年代'], 567, '渝中阿丽'),

    makeMemory(1503, '磁器口', '重庆', '沙坪坝区', 106.4500, 29.5800, '重庆市沙坪坝区磁器口',
    './images/nationwide/1503_old.jpg',
    './images/nationwide/1503_new.jpg',
      '90年代', '90年代的磁器口，还只是一个普通的古镇。后来经过开发，变成了重庆最热闹的古镇。陈麻花、毛血旺、鸡杂...每一样都是磁器口的招牌。',
      ['磁器口', '古镇', '陈麻花', '90年代'], 312, '沙坪坝居民'),

    makeMemory(1504, '长江索道', '重庆', '渝中区', 106.5400, 29.5500, '重庆市渝中区新华路',
    './images/nationwide/1504_old.jpg',
    './images/nationwide/1504_new.jpg',
      '90年代', '90年代的长江索道，是重庆人过江的交通工具。那时候坐索道只要几毛钱，车厢里挤满了上班的人。现在变成了旅游景点，排队要排一个多小时。',
      ['长江索道', '过江', '交通工具', '90年代'], 289, '渝北阿龙'),

    // ========== 郑州 Zhengzhou ==========
    makeMemory(1601, '二七塔', '郑州', '二七区', 113.6500, 34.7500, '郑州市二七区二七广场',
    './images/nationwide/1601_old.jpg',
    './images/nationwide/1601_new.jpg',
      '80年代', '1985年的二七塔，是郑州最高的建筑。这座塔是为了纪念1923年二七大罢工而建，是郑州的精神象征。那时候塔周围还没有这么多商场，是一片开阔的广场。',
      ['二七塔', '二七大罢工', '精神象征', '80年代'], 234, '中原阿明'),

    makeMemory(1602, '少林寺', '郑州', '登封市', 112.9300, 34.5000, '郑州市登封市少林寺',
    './images/nationwide/1602_old.jpg',
    './images/nationwide/1602_new.jpg',
      '80年代', '80年代的少林寺，因为李连杰的电影《少林寺》而名扬天下。那时候来少林寺学武的年轻人络绎不绝，寺里的武僧每天练功。少林功夫，从此成为中国的文化名片。',
      ['少林寺', '少林功夫', '李连杰', '80年代'], 445, '武术爱好者'),

    makeMemory(1603, '黄河风景区', '郑州', '惠济区', 113.4800, 34.9700, '郑州市惠济区黄河大堤',
    './images/nationwide/1603_old.jpg',
    './images/nationwide/1603_new.jpg',
      '90年代', '90年代的黄河风景区，炎黄二帝巨像正在建设中。"黄河之水天上来，奔流到海不复回"，站在黄河大堤上，可以感受到母亲河的磅礴气势。',
      ['黄河', '炎黄二帝', '母亲河', '90年代'], 178, '黄河儿女'),

    makeMemory(1604, '德化街', '郑州', '二七区', 113.6500, 34.7500, '郑州市二七区德化街',
    './images/nationwide/1604_old.jpg',
    './images/nationwide/1604_new.jpg',
      '90年代', '90年代的德化街，是郑州最繁华的商业街。那时候来德化街，主要是为了买衣服和吃小吃。街上的夜市非常热闹，各种小商品琳琅满目。',
      ['德化街', '商业街', '夜市', '90年代'], 156, '二七居民'),

    // ========== 济南 Jinan ==========
    makeMemory(1701, '趵突泉', '济南', '历下区', 117.0000, 36.6600, '济南市历下区趵突泉南路',
    './images/nationwide/1701_old.jpg',
    './images/nationwide/1701_new.jpg',
      '80年代', '1985年的趵突泉，三股泉水喷涌而出，声如隐雷。"天下第一泉"的美誉，让趵突泉成为济南的象征。那时候趵突泉公园还没有现在这么大，但泉水更加清澈。',
      ['趵突泉', '天下第一泉', '泉水', '80年代'], 312, '泉城阿明'),

    makeMemory(1702, '大明湖', '济南', '历下区', 117.0200, 36.6700, '济南市历下区大明湖路',
    './images/nationwide/1702_old.jpg',
    './images/nationwide/1702_new.jpg',
      '90年代', '90年代的大明湖，"四面荷花三面柳，一城山色半城湖"。那时候大明湖还没有免费开放，但门票只要几毛钱。夏天来大明湖看荷花，是济南人最惬意的享受。',
      ['大明湖', '荷花', '夏雨荷', '90年代'], 267, '历下居民'),

    makeMemory(1703, '千佛山', '济南', '历下区', 117.0300, 36.6400, '济南市历下区经十一路',
    './images/nationwide/1703_old.jpg',
    './images/nationwide/1703_new.jpg',
      '80年代', '80年代的千佛山，兴国禅寺还在，千佛崖还在。每年农历三月三，山上有庙会，人山人海。那时候上山的路还是土路，但人们虔诚的心一点都没有变。',
      ['千佛山', '兴国禅寺', '庙会', '80年代'], 198, '济南老张'),

    makeMemory(1704, '芙蓉街', '济南', '历下区', 117.0100, 36.6600, '济南市历下区芙蓉街',
    './images/nationwide/1704_old.jpg',
    './images/nationwide/1704_new.jpg',
      '90年代', '90年代的芙蓉街，还只是一条普通的泉城老街。后来经过改造，变成了济南最热闹的美食街。油旋、甜沫、把子肉...每一样都是老济南的味道。',
      ['芙蓉街', '美食街', '油旋', '90年代'], 156, '泉城吃货')
  ];

  // 合并到 DB.memories
  function injectData() {
    if (typeof DB !== 'undefined' && DB.memories) {
      var added = 0;
      newMemories.forEach(function(mem) {
        var exists = DB.memories.some(function(m) { return m.id === mem.id; });
        if (!exists) {
          DB.memories.push(mem);
          added++;
        }
      });
      if (added > 0) {
        console.log('[NationwideData] 已加载 ' + added + ' 条全国地标数据，当前共 ' + DB.memories.length + ' 条');
      }
      return true;
    } else {
      console.warn('[NationwideData] DB.memories 不存在，数据未加载');
      return false;
    }
  }

  // 刷新地图标记
  function refreshMapMarkers() {
    if (typeof app !== 'undefined' && app.map) {
      // 清除旧标记层（避免叠加）
      if (app.markerLayer) {
        app.map.removeLayer(app.markerLayer);
        app.markerLayer = null;
      }
      app.markers = [];
      // 重新添加标记
      if (app.addMapMarkers) {
        app.addMapMarkers();
        console.log('[NationwideData] 地图标记已刷新，当前共 ' + DB.memories.length + ' 条数据');
      }
    }
  }

  // 立即注入并刷新地图
  var addedCount = injectData();
  if (addedCount) {
    refreshMapMarkers();
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      makeMemory,
      injectData,
      refreshMapMarkers
    };
  }
})();

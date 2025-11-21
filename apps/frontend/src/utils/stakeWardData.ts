export interface Ward {
  value: string;
  label: string;
}

export interface Stake {
  value: string;
  label: string;
  wards: Ward[];
}

export const STAKES_AND_WARDS: Stake[] = [
  {
    value: 'seoul-stake',
    label: '서울 스테이크',
    wards: [
      { value: 'nokbeon-ward', label: '녹번 와드' },
      { value: 'sindang-ward', label: '신당 와드' },
      { value: 'sinchon-ward', label: '신촌 와드' },
      { value: 'ilsan-ward', label: '일산 와드' },
      { value: 'paju-ward', label: '파주 와드' },
      { value: 'jungang-deaf-branch', label: '중앙 농아 지부' },
    ],
  },
  {
    value: 'seoul-east-stake',
    label: '서울 동 스테이크',
    wards: [
      { value: 'gangbuk1-ward', label: '강북1 와드' },
      { value: 'gangbuk2-ward', label: '강북2 와드' },
      { value: 'gyomun-ward', label: '교문 와드' },
      { value: 'dongdaemun-ward', label: '동대문 와드' },
      { value: 'uijeongbu-ward', label: '의정부 와드' },
      { value: 'chuncheon-ward', label: '춘천 와드' },
    ],
  },
  {
    value: 'seoul-south-stake',
    label: '서울 남 스테이크',
    wards: [
      { value: 'gangnam1-ward', label: '강남1 와드' },
      { value: 'gangnam2-ward', label: '강남2 와드' },
      { value: 'songpa-ward', label: '송파 와드' },
      { value: 'ansan-ward', label: '안산 와드' },
      { value: 'anyang-ward', label: '안양 와드' },
    ],
  },
  {
    value: 'seoul-west-stake',
    label: '서울 서 스테이크',
    wards: [
      { value: 'kimpo-ward', label: '김포 와드' },
      { value: 'bucheon-ward', label: '부천 와드' },
      { value: 'yeongdeungpo-ward', label: '영등포 와드' },
      { value: 'incheon1-ward', label: '인천1 와드' },
      { value: 'incheon2-ward', label: '인천2 와드' },
      { value: 'cheongna-ward', label: '청라 와드' },
    ],
  },
  {
    value: 'gyeonggi-stake',
    label: '경기 스테이크',
    wards: [
      { value: 'gokbanjeong-ward', label: '곡반정 와드' },
      { value: 'bundang-ward', label: '분당 와드' },
      { value: 'suji-ward', label: '수지 와드' },
      { value: 'singal-ward', label: '신갈 와드' },
      { value: 'sinpung-ward', label: '신풍 와드' },
      { value: 'icheon-ward', label: '이천 와드' },
      { value: 'pyeongtaek-ward', label: '평택 와드' },
      { value: 'anseong-branch', label: '안성 지부' },
    ],
  },
  {
    value: 'daejeon-stake',
    label: '대전 스테이크',
    wards: [
      { value: 'gongju-ward', label: '공주 와드' },
      { value: 'daejeon1-ward', label: '대전1 와드' },
      { value: 'daejeon2-ward', label: '대전2 와드' },
      { value: 'sejong-ward', label: '세종 와드' },
      { value: 'nonsan-branch', label: '논산 지부' },
      { value: 'seosan-branch', label: '서산 지부' },
    ],
  },
  {
    value: 'cheongju-stake',
    label: '청주 스테이크',
    wards: [
      { value: 'sangdang-ward', label: '상당 와드' },
      { value: 'cheongju-heungdeok-ward', label: '흥덕 와드' },
      { value: 'cheon-an-ward', label: '천안 와드' },
      { value: 'chungju-ward', label: '충주 와드' },
      { value: 'onyang-branch', label: '온양 지부' },
      { value: 'jecheon-branch', label: '제천 지부' },
    ],
  },
  {
    value: 'jeonju-stake',
    label: '전주 스테이크',
    wards: [
      { value: 'gunsan-ward', label: '군산 와드' },
      { value: 'iksan-ward', label: '익산 와드' },
      { value: 'deokjin-ward', label: '덕진 와드' },
      { value: 'wansan-ward', label: '완산 와드' },
      { value: 'jeongeup-ward', label: '정읍 와드' },
      { value: 'gimje-branch', label: '김제 지부' },
      { value: 'namwon-branch', label: '남원 지부' },
    ],
  },
  {
    value: 'gwangju-stake',
    label: '광주 스테이크',
    wards: [
      { value: 'nongseong-ward', label: '농성 와드' },
      { value: 'mokpo-ward', label: '목포 와드' },
      { value: 'cheomdan-ward', label: '첨단 와드' },
      { value: 'chungjang-ward', label: '충장 와드' },
      { value: 'naju-branch', label: '나주 지부' },
    ],
  },
  {
    value: 'busan-stake',
    label: '부산 스테이크',
    wards: [
      { value: 'gwaan-ward', label: '광안 와드' },
      { value: 'geumjeong-ward', label: '금정 와드' },
      { value: 'sujeong-ward', label: '수정 와드' },
      { value: 'yeonsan-ward', label: '연산 와드' },
      { value: 'oncheon-ward', label: '온천 와드' },
      { value: 'haeundae-ward', label: '해운대 와드' },
      { value: 'busan-ward', label: '부산 와드' },
      { value: 'gimhae-ward', label: '김해 와드' },
      { value: 'goejeong-branch', label: '괴정 지부' },
      { value: 'gupo-branch', label: '구포 지부' },
      { value: 'daesin-branch', label: '대신 지부' },
      { value: 'yeongdo-branch', label: '영도 지부' },
    ],
  },
  {
    value: 'daegu-stake',
    label: '대구 스테이크',
    wards: [
      { value: 'sangin-ward', label: '상인 와드' },
      { value: 'suseong-ward', label: '수성 와드' },
      { value: 'jungni-ward', label: '중리 와드' },
      { value: 'gumi-ward', label: '구미 와드' },
      { value: 'gyeongsan-branch', label: '경산 지부' },
      { value: 'andong-branch', label: '안동 지부' },
      { value: 'kimcheon-branch', label: '김천 지부' },
    ],
  },
  {
    value: 'changwon-stake',
    label: '창원 스테이크',
    wards: [
      { value: 'dogye-ward', label: '도계 와드' },
      { value: 'masan-ward', label: '마산 와드' },
      { value: 'jinju-ward', label: '진주 와드' },
      { value: 'jinhe-ward', label: '진해 와드' },
      { value: 'geoje-branch', label: '거제 지부' },
      { value: 'miryang-branch', label: '밀양 지부' },
      { value: 'sacheon-branch', label: '사천 지부' },
      { value: 'tongyeong-branch', label: '통영 지부' },
    ],
  },
  {
    value: 'jeju-branch',
    label: '제주 지방부',
    wards: [
      { value: 'jeju-branch', label: '제주 지부' },
      { value: 'seogwipo-branch', label: '서귀포 지부' },
    ],
  },
  {
    value: 'seoul-military-district',
    label: '서울 미군 지방부',
    wards: [
      { value: 'gunsan-military-branch', label: '군산 군인 지부' },
      { value: 'northern-military-branch', label: '노던 군인 지부' },
      { value: 'daegu-military-branch', label: '대구 군인 지부' },
      { value: 'seoul-english-branch', label: '서울 영어 지부' },
      { value: 'songdo-english-branch', label: '송도 영어 지부' },
      { value: 'osan-military-branch', label: '오산 군인 지부' },
      { value: 'humphreys-military-branch', label: '험프리 군인 지부' },
    ],
  },
  {
    value: 'gangneung-district',
    label: '강릉 지방부',
    wards: [
      { value: 'gangneung-branch', label: '강릉 지부' },
      { value: 'donghae-branch', label: '동해 지부' },
      { value: 'sokcho-branch', label: '속초 지부' },
      { value: 'wonju-branch', label: '원주 지부' },
      { value: 'taebaek-branch', label: '태백 지부' },
    ],
  },
  {
    value: 'suncheon-district',
    label: '순천 지방부',
    wards: [
      { value: 'gwangyang-branch', label: '광양 지부' },
      { value: 'suncheon-branch', label: '순천 지부' },
      { value: 'yeosu-branch', label: '여수 지부' },
    ],
  },
  {
    value: 'ulsan-district',
    label: '울산 지방부',
    wards: [
      { value: 'gyeongju-branch', label: '경주 지부' },
      { value: 'bangojin-branch', label: '방어진 지부' },
      { value: 'sinjeong-branch', label: '신정 지부' },
      { value: 'pohang-branch', label: '포항 지부' },
      { value: 'hoge-branch', label: '호계 지부' },
    ],
  },
];

export const getStakeOptions = () => {
  return STAKES_AND_WARDS.map((stake) => ({
    value: stake.value,
    label: stake.label,
  }));
};

export const getWardOptions = (stakeValue: string) => {
  const stake = STAKES_AND_WARDS.find((s) => s.value === stakeValue);
  return stake ? stake.wards : [];
};

export const getStakeByValue = (stakeValue: string): Stake | undefined => {
  return STAKES_AND_WARDS.find((s) => s.value === stakeValue);
};

export const getWardByValue = (
  stakeValue: string,
  wardValue: string
): Ward | undefined => {
  const stake = getStakeByValue(stakeValue);
  return stake?.wards.find((w) => w.value === wardValue);
};

export const findStakeByWardValue = (wardValue: string): Stake | undefined => {
  return STAKES_AND_WARDS.find((stake) =>
    stake.wards.some((ward) => ward.value === wardValue)
  );
};

export const findStakeValueByText = (stakeText: string): string | undefined => {
  if (!stakeText) return undefined;
  const normalized = stakeText.trim().toLowerCase();
  const stake = STAKES_AND_WARDS.find(
    (s) =>
      s.value.toLowerCase() === normalized ||
      s.label.toLowerCase() === normalized ||
      s.label.toLowerCase().replace(/\s+/g, '-') === normalized
  );
  return stake?.value;
};

export const findWardValueByText = (
  stakeValue: string,
  wardText: string
): string | undefined => {
  if (!wardText || !stakeValue) return undefined;
  const stake = getStakeByValue(stakeValue);
  if (!stake) return undefined;
  const normalized = wardText.trim().toLowerCase();
  const ward = stake.wards.find(
    (w) =>
      w.value.toLowerCase() === normalized ||
      w.label.toLowerCase() === normalized ||
      w.label.toLowerCase().replace(/\s+/g, '-') === normalized
  );
  return ward?.value;
};

export const getStakeLabel = (stakeValue: string): string | undefined => {
  const stake = getStakeByValue(stakeValue);
  return stake?.label;
};

export const getWardLabel = (
  stakeValue: string,
  wardValue: string
): string | undefined => {
  const ward = getWardByValue(stakeValue, wardValue);
  return ward?.label;
};

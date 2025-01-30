export interface UserItem {
  id: string;
  name: string;
  username: string;
  image: any;
  following: boolean;
}

export const dummyData: UserItem[] = [
  {
    id: '1',
    name: 'Jian',
    username: '@jianYang',
    image: require('../assets/images/Smiley.png'),
    following: false,
  },
  {
    id: '2',
    name: 'John',
    username: '@johnDoe',
    image: require('../assets/images/Smiley.png'),
    following: true,
  },
  {
    id: '3',
    name: 'Alice',
    username: '@aliceSmith',
    image: require('../assets/images/Smiley.png'),
    following: false,
  },
  {
    id: '4',
    name: 'Bob',
    username: '@bob123',
    image: require('../assets/images/Smiley.png'),
    following: true,
  },
  {
    id: '5',
    name: 'Charlie',
    username: '@charlieBrown',
    image: require('../assets/images/Smiley.png'),
    following: false,
  },
  {
    id: '6',
    name: 'David',
    username: '@davidKing',
    image: require('../assets/images/Smiley.png'),
    following: true,
  },
  {
    id: '7',
    name: 'Eve',
    username: '@eveMiller',
    image: require('../assets/images/Smiley.png'),
    following: false,
  },
  {
    id: '8',
    name: 'Frank',
    username: '@frankWhite',
    image: require('../assets/images/Smiley.png'),
    following: true,
  },
  {
    id: '9',
    name: 'Grace',
    username: '@graceLee',
    image: require('../assets/images/Smiley.png'),
    following: false,
  },
  {
    id: '10',
    name: 'Hank',
    username: '@hankWright',
    image: require('../assets/images/Smiley.png'),
    following: false,
  },
];

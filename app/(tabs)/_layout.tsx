import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts, fontSizes } from '../../brand/tokens/brand-tokens';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconName;
  iconActive: IoniconName;
};

const TABS: TabConfig[] = [
  { name: 'index',  title: 'Weather', icon: 'cloud-outline',  iconActive: 'cloud'  },
  { name: 'prayer', title: 'Prayer',  icon: 'moon-outline',   iconActive: 'moon'   },
  { name: 'quran',  title: 'Quran',   icon: 'book-outline',   iconActive: 'book'   },
  { name: 'more',   title: 'More',    icon: 'grid-outline',   iconActive: 'grid'   },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDarkSecondary,
        tabBarStyle: {
          backgroundColor: colors.bgDark,
          borderTopColor: colors.borderDark,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: fontSizes.xs,
          letterSpacing: 0.4,
        },
      }}
    >
      {TABS.map(({ name, title, icon, iconActive }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? iconActive : icon}
                size={24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

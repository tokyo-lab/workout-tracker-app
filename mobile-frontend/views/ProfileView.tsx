import React, { useState } from 'react';
import Header from '../components/Header';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { useTheme } from '../src/hooks/useTheme';
import { getThemedStyles } from '../src/utils/themeUtils';
import { globalStyles, colors } from '../src/styles/globalStyles';

interface ProfileProps {
  initialUserName: string;
  initialEmail: string;
  initialDarkMode: boolean;
  initialAccentColor: string;
  onSave: (userData: { userName: string; email: string }) => void;
}

const ProfileView: React.FC<ProfileProps> = ({
  initialUserName,
  initialEmail,
  initialDarkMode = true,
  initialAccentColor,
  onSave
}) => {
  const [userName, setUserName] = useState(initialUserName);
  const [email, setEmail] = useState(initialEmail);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [accentColor, setAccentColor] = useState(initialAccentColor);
  const { state, dispatch } = useTheme();
  const themedStyles = getThemedStyles(state.theme, state.accentColor);

  const accentColors = ['#F99C57', '#A6E221', '#D93B56', '#3F75DF', '#FC63D2'];

  const handleSave = () => {
    onSave({ userName, email });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUserName(initialUserName);
    setEmail(initialEmail);
    setIsEditing(false);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    dispatch({ type: 'SET_THEME', payload: value ? 'dark' : 'light' });
  };

  const handleAccentColorChange = (newColor: string) => {
    dispatch({ type: 'SET_ACCENT_COLOR', payload: newColor });
  };

  const handleSectionToggle = (section: 'profile' | 'settings') => {
    if (section === 'profile') {
      setIsProfileExpanded(!isProfileExpanded);
      setIsSettingsExpanded(false);
    } else {
      setIsSettingsExpanded(!isSettingsExpanded);
      setIsProfileExpanded(false);
    }
  };

  return (
    <View
      style={[
        globalStyles.container,
        { backgroundColor: themedStyles.primaryBackgroundColor }
      ]}
    >
      <Header pageName='Profile' />

      {/* profile details section */}

      <View
        style={[
          globalStyles.section,
          { backgroundColor: themedStyles.secondaryBackgroundColor }
        ]}
      >
        <TouchableOpacity
          // onPress={() => setIsProfileExpanded(!isProfileExpanded)}
          onPress={() => handleSectionToggle('profile')}
        >
          <View
            style={[
              globalStyles.sectionHeader,
              { backgroundColor: themedStyles.secondaryBackgroundColor }
            ]}
          >
            <MaterialCommunityIcons
              name='account-outline'
              style={[globalStyles.icon, { color: themedStyles.textColor }]}
            />

            <Text
              style={[
                globalStyles.sectionTitle,
                { color: themedStyles.textColor }
              ]}
            >
              Profile Details
            </Text>
            <Entypo
              name={isProfileExpanded ? 'chevron-thin-up' : 'chevron-thin-down'}
              size={20}
              color={themedStyles.textColor}
            />
          </View>
        </TouchableOpacity>

        {isProfileExpanded && (
          <View
            style={[
              globalStyles.sectionContent,
              { backgroundColor: themedStyles.secondaryBackgroundColor }
            ]}
          >
            <Text
              style={[globalStyles.label, { color: themedStyles.textColor }]}
            >
              User Name
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                { backgroundColor: themedStyles.primaryBackgroundColor }
              ]}
              value={userName}
              onChangeText={setUserName}
              editable={isEditing}
            />
            <Text
              style={[globalStyles.label, { color: themedStyles.textColor }]}
            >
              Email
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                { backgroundColor: themedStyles.primaryBackgroundColor }
              ]}
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              keyboardType='email-address'
            />
          </View>
        )}
      </View>

      {/* settings section */}
      <View
        style={[
          globalStyles.section,
          { backgroundColor: themedStyles.secondaryBackgroundColor }
        ]}
      >
        <TouchableOpacity
          // onPress={() => setIsSettingsExpanded(!isSettingsExpanded)}
          onPress={() => handleSectionToggle('settings')}
        >
          <View
            style={[
              globalStyles.sectionHeader,
              { backgroundColor: themedStyles.secondaryBackgroundColor }
            ]}
          >
            <EvilIcons
              name='gear'
              style={[globalStyles.icon, { color: themedStyles.textColor }]}
            />
            <Text
              style={[
                globalStyles.sectionTitle,
                { color: themedStyles.textColor }
              ]}
            >
              Settings
            </Text>
            <Entypo
              name={
                isSettingsExpanded ? 'chevron-thin-up' : 'chevron-thin-down'
              }
              size={20}
              color={themedStyles.textColor}
            />
          </View>
        </TouchableOpacity>

        {isSettingsExpanded && (
          <View
            style={[
              globalStyles.sectionContent,
              { backgroundColor: themedStyles.secondaryBackgroundColor }
            ]}
          >
            <View style={styles.settingRow}>
              <FontAwesome
                name='moon-o'
                style={[globalStyles.icon, { color: themedStyles.textColor }]}
              />

              <Text
                style={[styles.settingLabel, { color: themedStyles.textColor }]}
              >
                Dark Mode
              </Text>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: colors.offWhite, true: colors.green }}
                thumbColor={darkMode ? colors.black : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingRow}>
              <Ionicons
                name='color-filter-outline'
                style={[globalStyles.icon, { color: themedStyles.textColor }]}
              />

              <Text
                style={[styles.settingLabel, { color: themedStyles.textColor }]}
              >
                Accent Color
              </Text>
            </View>

            <View style={styles.colorPicker}>
              {accentColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => handleAccentColorChange(color)}
                >
                  {color === state.accentColor && (
                    <View>
                      <Ionicons
                        name='checkmark-sharp'
                        size={20}
                        color={colors.black}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {!isEditing ? (
        <TouchableOpacity
          style={[
            globalStyles.button,
            { backgroundColor: themedStyles.secondaryBackgroundColor }
          ]}
          onPress={() => setIsEditing(true)}
        >
          <Text
            style={[
              globalStyles.buttonText,
              { color: themedStyles.accentColor }
            ]}
          >
            EDIT
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              globalStyles.button,
              styles.saveButton,
              { backgroundColor: themedStyles.secondaryBackgroundColor }
            ]}
            onPress={handleSave}
          >
            <Text
              style={[
                globalStyles.buttonText,
                { color: themedStyles.accentColor }
              ]}
            >
              SAVE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.button,
              styles.cancelButton,
              { backgroundColor: themedStyles.secondaryBackgroundColor }
            ]}
            onPress={handleCancel}
          >
            <Text
              style={[
                globalStyles.buttonText,
                { color: themedStyles.accentColor }
              ]}
            >
              CANCEL
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  settingLabel: {
    fontFamily: 'Lexend',
    flex: 1,
    marginLeft: 10
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  saveButton: {
    flex: 1,
    marginRight: 10
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10
  }
});

export default ProfileView;
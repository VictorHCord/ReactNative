import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  SubmitButton,
  Input,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  ProfileButtonClosed,
  ButtoClosed,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    /* Vai armazenar o texto que vem dentro do input */
    newUser: '',

    /* Vai armazenar os itens */
    UserLogin: [],
    loading: false,
  };

  /* Vai buscar os dados no Storage */
  async componentDidMount() {
    const UserLogin = await AsyncStorage.getItem('UserLogin');

    if (UserLogin) {
      this.setState({ UserLogin: JSON.parse(UserLogin) });
    }
  }
  /* Vai executar quando houver alterações no user */
  componentDidUpdate(_, prevState) {
    const { UserLogin } = this.state;

    if (prevState.UserLogin !== UserLogin) {
      AsyncStorage.setItem('UserLogin', JSON.stringify(UserLogin));
    }
  }

  handleAddUser = async () => {
    const { UserLogin, newUser } = this.state;

    this.setState({ loading: true });

    if (newUser !== '') {
      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };
      this.setState({
        UserLogin: [...UserLogin, data],
        newUser: '',
        loading: false,
      });

      Keyboard.dismiss();
    } else {
      Alert.alert('Erro', 'Por gentileza informe um usuário.');

      this.setState({
        loading: false,
      });
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;
    navigation.navigate('User', { user });
  };

  clearAsyncStorage = async id => {
    const { UserLogin } = this.state;
    const index = UserLogin.indexOf(id);

    UserLogin.splice(index, 1);
    await AsyncStorage.setItem('UserLogin', JSON.stringify(UserLogin));
    this.setState({
      UserLogin: JSON.parse(await AsyncStorage.getItem('UserLogin')),
    });
  };

  render() {
    const { UserLogin, newUser, loading } = this.state;
    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Informe o usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="add" size={20} color="#fff" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={UserLogin}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver perfil</ProfileButtonText>
              </ProfileButton>
              <ProfileButtonClosed onPress={() => this.clearAsyncStorage()}>
                <ButtoClosed>Deletar</ButtoClosed>
              </ProfileButtonClosed>
            </User>
          )}
        />
      </Container>
    );
  }
}

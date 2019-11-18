import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
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
  ButtoClosed

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
    gitUser: [],
    loading: false,
  };

  /* Vai buscar os dados no Storage */
  async componentDidMount() {
    const gitUser = await AsyncStorage.getItem('gitUser');

    if (gitUser) {
      this.setState({ gitUser: JSON.parse(gitUser) });
    }
  }
  /* Vai executar quando houver alterações no user */
  componentDidUpdate(_, prevState) {
    const { gitUser } = this.state;

    if (prevState.gitUser !== gitUser) {
      AsyncStorage.setItem('gitUser', JSON.stringify(gitUser));
    }
  }

  handleAddUser = async () => {
    const { gitUser, newUser } = this.state;

    this.setState({ loading: true });

    const response = await api.get(`/users/${newUser}`);

    const data = {
      name: response.data.name,
      login: response.data.login,
      bio: response.data.bio,
      avatar: response.data.avatar_url,
    };
    this.setState({
      gitUser: [...gitUser, data],
      newUser: '',
      loading: false,
    });
    Keyboard.dismiss();
  };


  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  clearAsyncStorage = async id => {
    const { gitUser } = this.state;
    gitUser.splice(id, 1);
    await AsyncStorage.setItem('gitUser', JSON.stringify(gitUser));
    this.setState({
      gitUser: JSON.parse(await AsyncStorage.getItem('gitUser'))
    })
  };

  render() {
    const { gitUser, newUser, loading } = this.state;


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
          data={gitUser}
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

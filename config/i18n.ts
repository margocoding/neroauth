const i18n = {
  ru: {
    code: {
      banner: "/uploads/assets/banners/code/ru.webp",
      title: "Код подтверждения",
      description:
        "На вашу почту был отправлен код подтверждения, если вы не отправляли этот код просто проигнорируйте это сообщение. Никому код не сообщайте",
      code_title: "Ваш код: ",
    },
    newInvitation: {
      banner: "/uploads/assets/banners/new-request/ru.webp",
      title: "Новая заявка в друзья",
      description:
        "Пользователь <strong>{username}</strong> отправил вам приглашение в друзья.",
      subdescription: "Вы можете принять или отклонить его в своём профиле.",
      button: "Посмотреть приглашения",
    },
    applyInvitation: {
      banner: "/uploads/assets/banners/accept-request/ru.webp",
      title: "Новый друг",
      description:
        "Человек, которого вы пригласили, принял ваше предложение дружбы. Теперь он добавлен в ваш список друзей!",
      subdescription: "Теперь вы можете видеть его игровой прогресс.",
      button: "Посмотреть список друзей",
    },
    newSession: {
      banner: "/uploads/assets/banners/signin/ru.webp",
      title: "Новый вход в аккаунт NeroAuth",
      subtitle:
        "Мы заметили, что вы только что вошли в свой аккаунт с нового устройства. Вот подробности вашего входа:",
      location: `<strong>Местоположение:</strong><br>
                Страна: {country}<br>
                Город: {city}
            `,
      device: `<strong>Устройство:</strong><br>
                Тип устройства: {deviceType}<br>
                Устройство: {device}<br>
                Браузер: {browser}<br>
                Операционная система: {os}
                `,
      result: "Вход выполнен успешно",
    },
  },
  en: {
    code: {
      banner: "/uploads/assets/banners/code/en.webp",
      title: "Confirmation code",
      description:
        "Verification code have sent to your email. If you have not sent this code just ignore this message. Do not tell code anyone",
      code_title: "Your code:",
    },
    newInvitation: {
      banner: "/uploads/assets/banners/new-request/en.webp",
      title: "New friend invitation",
      description:
        "User <strong>{username}</strong> has sent a friend invitation",
      subdescription: "You cam apply or decline it at your profile",
      button: "Watch invitations",
    },
    applyInvitation: {
      banner: "/uploads/assets/banners/accept-request/en.webp",
      title: "New friend",
      description:
        "The user has applied your friend invitation. He has added in your friend list now",
      subdescription: "You can see his game progress now",
      button: "Watch friend list",
    },
    newSession: {
        banner: "/uploads/assets/banners/signin/en.webp",
        title: "New sign-in to your NeroAuth account",
        subtitle: 'We found out that you have just logged in from a new device. Information about log in:',
        location: `
        <strong>Location: </strong>
        Country: {country}<br>,
        City: {city}
        `,
        device: `<strong>Device:</strong><br>
        Device type: {deviceType}<br>
        Device: {device}<br>
        Browser: {browser}<br>
        OS: {os}
        `,
        result: 'Log in was success'
    }
  },
};

export enum Locale {
  RU = "ru",
  EN = "en",
}

export default i18n;

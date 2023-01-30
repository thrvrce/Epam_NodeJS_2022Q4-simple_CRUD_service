drop table if exists users;

create table if not exists users (
	id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	login varchar(50) UNIQUE NOT NULL,
	password varchar(50) NOT NULL,
	age smallint NOT NULL,
	"isDeleted" boolean NOT NULL
);

insert into users (login, password, age, "isDeleted") values 
('login_1', 'password_1', 21, false),
('login_2', 'password_2', 22, true),
('login_3', 'password_3', 23, false);

select * from users
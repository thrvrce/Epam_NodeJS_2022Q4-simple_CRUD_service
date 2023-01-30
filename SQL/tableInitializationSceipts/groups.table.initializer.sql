drop table if exists groups;

create table if not exists groups (
	id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
	name varchar(30) UNIQUE NOT NULL,
	permissions varchar(30)[] NOT NULL
);

insert into groups (name, permissions) values
('group_1', ARRAY ['READ', 'WRITE', 'DELETE', 'SHARE', 'UPLOAD_FILES']),
('group_2', ARRAY ['READ', 'WRITE', 'DELETE', 'SHARE']),
('group_3', ARRAY ['READ', 'WRITE', 'DELETE']);

select * from groups
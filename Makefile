mysql-connect:
	docker-compose exec mysql mysql --user=reversi --password=password reversi
mysql-load:
	cat mysql/init.sql | docker-compose exec -T mysql mysql --user=reversi --password=password

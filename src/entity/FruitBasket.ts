import {Entity, Column, BaseEntity, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import "reflect-metadata";
import {Apple} from "./Apple";

// creates table fruit_basket
@Entity()
export class FruitBasket extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    numFruits: number;

    @OneToMany(type => Apple, apple => apple.fruitbasket)
    apples: Apple[];
}
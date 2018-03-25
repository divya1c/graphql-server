import {Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {FruitBasket} from "./FruitBasket";

// creates table apple
@Entity()
export class Apple extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    color: string;

    @Column()
    size: string;

    @ManyToOne(type => FruitBasket, fruitbasket => fruitbasket.apples)
    fruitbasket: FruitBasket;
}
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Proyecto ASIR',
    description: (
      <>
        Esta documentación está creada para el módulo 
        de Administración de Sistemas Informáticos en Red (ASIR), orientada a facilitar el aprendizaje y consulta.
      </>
    ),
  },
  {
    title: 'Automatización de Servicios',
    description: (
      <>
        El sistema permite desplegar servicios web de forma rápida y sencilla, utilizando tecnologías como Proxmox, Docker y FastAPI.
      </>
    ),
  },
  {
    title: '100% Open Source',
    description: (
      <>
        Todos los componentes del proyecto están basados en software libre, fomentando la transparencia, la colaboración y la mejora continua.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}